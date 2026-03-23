package com.vultr.convolve.controller;
import com.vultr.convolve.service.ImageMetricsService;
import com.vultr.convolve.service.ImageMetricsService.ImageMetricsResult;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;
@RestController
@RequestMapping("/api")
public class ImageProcessingController {
    private final ImageMetricsService metricsService;
    public ImageProcessingController(ImageMetricsService metricsService) {
        this.metricsService = metricsService;
    }
    @GetMapping("/health")
    public ResponseEntity> health() {
        return ResponseEntity.ok(Map.of("status","UP","service","VULTR-CONVOLVE","version","1.0.0"));
    }
    @PostMapping(value="/metrics", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity computeMetrics(
            @RequestPart("original") MultipartFile original,
            @RequestPart("filtered") MultipartFile filtered) {
        if (original.isEmpty() || filtered.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error","Both files are required."));
        if (!isImage(original) || !isImage(filtered))
            return ResponseEntity.badRequest().body(Map.of("error","Only image files accepted."));
        try {
            ImageMetricsResult r = metricsService.computeMetrics(original, filtered);
            return ResponseEntity.ok(toMap(r));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error",e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error",e.getMessage()));
        }
    }
    @PostMapping(value="/convolve", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity convolveImage(
            @RequestPart("image") MultipartFile imageFile,
            @RequestParam("kernel") String kernelParam,
            @RequestParam(value="intensity", defaultValue="1.0") float intensity,
            @RequestParam(value="normalize", defaultValue="false") boolean normalize) {
        if (imageFile.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error","Image file is required."));
        if (!isImage(imageFile))
            return ResponseEntity.badRequest().body(Map.of("error","Only image files accepted."));
        float[] kernel;
        try { kernel = parseKernel(kernelParam); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("error",e.getMessage())); }
        try {
            BufferedImage original = ImageIO.read(imageFile.getInputStream());
            if (original == null)
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error","Cannot decode image."));
            if (normalize) kernel = normalizeKernel(kernel);
            BufferedImage filtered = applyConvolution(original, kernel, intensity);
            ImageMetricsResult metrics = metricsService.computeMetrics(original, filtered);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(filtered, "PNG", baos);
            byte[] bytes = baos.toByteArray();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(bytes.length);
            headers.set("X-MSE",            String.format("%.4f", metrics.mse()));
            headers.set("X-PSNR",           String.format("%.4f", metrics.psnr()));
            headers.set("X-PSNR-Formatted", metrics.psnrFormatted());
            headers.set("X-SSIM",           String.format("%.4f", metrics.ssim()));
            headers.set("X-SSIM-Percent",   metrics.ssimPercent());
            headers.set("X-Quality-Tier",   metrics.qualityTier());
            headers.set("X-Processing-Ms",  String.valueOf(metrics.processingMs()));
            headers.set("Access-Control-Expose-Headers","X-MSE,X-PSNR,X-PSNR-Formatted,X-SSIM,X-SSIM-Percent,X-Quality-Tier,X-Processing-Ms");
            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error",e.getMessage()));
        }
    }
    private boolean isImage(MultipartFile f) { String ct=f.getContentType(); return ct!=null&&ct.startsWith("image/"); }
    private float[] parseKernel(String raw) {
        String[] parts = raw.trim().split("[,\\s]+");
        if (parts.length!=9) throw new IllegalArgumentException("Kernel needs 9 values, got "+parts.length);
        float[] k=new float[9];
        for(int i=0;i<9;i++) k[i]=Float.parseFloat(parts[i].trim());
        return k;
    }
    private float[] normalizeKernel(float[] k) {
        float sum=0f; for(float v:k) if(v>0) sum+=v;
        if(sum==0f) return k;
        float[] out=new float[9]; for(int i=0;i<9;i++) out[i]=k[i]/sum; return out;
    }
    private BufferedImage applyConvolution(BufferedImage src, float[] kernel, float intensity) {
        BufferedImage rgb=toRGB(src);
        ConvolveOp op=new ConvolveOp(new Kernel(3,3,kernel),ConvolveOp.EDGE_NO_OP,null);
        BufferedImage filtered=op.filter(rgb,null);
        if(intensity>=1.0f) return filtered;
        int w=src.getWidth(),h=src.getHeight();
        BufferedImage out=new BufferedImage(w,h,BufferedImage.TYPE_INT_RGB);
        Graphics2D g=out.createGraphics();
        g.drawImage(rgb,0,0,null);
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER,intensity));
        g.drawImage(filtered,0,0,null);
        g.dispose(); return out;
    }
    private BufferedImage toRGB(BufferedImage src) {
        if(src.getType()==BufferedImage.TYPE_INT_RGB) return src;
        BufferedImage rgb=new BufferedImage(src.getWidth(),src.getHeight(),BufferedImage.TYPE_INT_RGB);
        Graphics2D g=rgb.createGraphics(); g.drawImage(src,0,0,null); g.dispose(); return rgb;
    }
    private Map toMap(ImageMetricsResult r) {
        return Map.of("mse",r.mse(),"psnr",Double.isInfinite(r.psnr())?999.0:r.psnr(),
            "psnrFormatted",r.psnrFormatted(),"ssim",r.ssim(),"ssimPercent",r.ssimPercent(),
            "qualityTier",r.qualityTier(),"psnrNormalized",r.psnrNormalized(),
            "processingMs",r.processingMs(),"imageWidth",r.imageWidth(),"imageHeight",r.imageHeight());
    }
}
