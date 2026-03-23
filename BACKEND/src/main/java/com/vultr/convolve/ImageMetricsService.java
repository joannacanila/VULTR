package com.vultr.convolve.service;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
@Service
public class ImageMetricsService {
    private static final double K1=0.01,K2=0.03,L=255.0;
    private static final double C1=(K1*L)*(K1*L),C2=(K2*L)*(K2*L);
    private static final int MAX_DIM=512;
    public ImageMetricsResult computeMetrics(MultipartFile originalFile,MultipartFile filteredFile) throws IOException {
        long t=System.nanoTime();
        BufferedImage orig=toRGB(decode(originalFile)),filt=toRGB(decode(filteredFile));
        if(orig.getWidth()!=filt.getWidth()||orig.getHeight()!=filt.getHeight())
            filt=resize(filt,orig.getWidth(),orig.getHeight());
        BufferedImage po=patch(orig),pf=patch(filt);
        double mse=mse(po,pf),psnr=psnr(mse),ssim=ssim(po,pf);
        return new ImageMetricsResult(mse,psnr,ssim,(System.nanoTime()-t)/1_000_000L,orig.getWidth(),orig.getHeight());
    }
    public ImageMetricsResult computeMetrics(BufferedImage orig,BufferedImage filt) {
        long t=System.nanoTime();
        orig=toRGB(orig); filt=toRGB(filt);
        if(orig.getWidth()!=filt.getWidth()||orig.getHeight()!=filt.getHeight())
            filt=resize(filt,orig.getWidth(),orig.getHeight());
        BufferedImage po=patch(orig),pf=patch(filt);
        double mse=mse(po,pf),psnr=psnr(mse),ssim=ssim(po,pf);
        return new ImageMetricsResult(mse,psnr,ssim,(System.nanoTime()-t)/1_000_000L,orig.getWidth(),orig.getHeight());
    }
    double mse(BufferedImage o,BufferedImage f) {
        int w=o.getWidth(),h=o.getHeight(); double s=0;
        for(int y=0;y0?sum/n:1.0;
    }
    private double blockSSIM(double[] x,double[] y) {
        int n=x.length; double mx=0,my=0;
        for(int i=0;i>16)&0xFF)+0.587*((rgb>>8)&0xFF)+0.114*(rgb&0xFF);
        }
        return l;
    }
    private double ch(int a,int b,int s){return (double)((a>>s)&0xFF)-(double)((b>>s)&0xFF);}
    private BufferedImage decode(MultipartFile f) throws IOException {
        try(InputStream in=f.getInputStream()){
            BufferedImage img=ImageIO.read(in);
            if(img==null) throw new IOException("Cannot decode: "+f.getOriginalFilename());
            return img;
        }
    }
    private BufferedImage toRGB(BufferedImage src) {
        if(src.getType()==BufferedImage.TYPE_INT_RGB) return src;
        BufferedImage r=new BufferedImage(src.getWidth(),src.getHeight(),BufferedImage.TYPE_INT_RGB);
        Graphics2D g=r.createGraphics(); g.drawImage(src,0,0,null); g.dispose(); return r;
    }
    private BufferedImage resize(BufferedImage src,int w,int h) {
        BufferedImage out=new BufferedImage(w,h,BufferedImage.TYPE_INT_RGB);
        Graphics2D g=out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(src,0,0,w,h,null); g.dispose(); return out;
    }
    private BufferedImage patch(BufferedImage src) {
        int w=src.getWidth(),h=src.getHeight();
        if(w<=MAX_DIM&&h<=MAX_DIM) return src;
        double sc=Math.min((double)MAX_DIM/w,(double)MAX_DIM/h);
        return resize(src,(int)(w*sc),(int)(h*sc));
    }
    public record ImageMetricsResult(double mse,double psnr,double ssim,long processingMs,int imageWidth,int imageHeight) {
        public String psnrFormatted(){return Double.isInfinite(psnr)?"∞ dB":String.format("%.2f dB",psnr);}
        public String ssimPercent(){return String.format("%.1f%%",ssim*100.0);}
        public double psnrNormalized(){if(Double.isInfinite(psnr))return 1.0;return Math.clamp((psnr-20.0)/30.0,0.0,1.0);}
        public String qualityTier(){
            if(ssim>=0.98&&psnr>=40.0)return "PRISTINE";
            if(ssim>=0.90&&psnr>=30.0)return "HIGH";
            if(ssim>=0.75&&psnr>=22.0)return "MEDIUM";
            return "LOW";
        }
    }
}
