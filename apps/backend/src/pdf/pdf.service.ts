import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import puppeteer from 'puppeteer';

interface RenderInput {
  companyName: string;
  logoUrl?: string | null;
  orderNumber: string;
  customerName: string;
  equipmentSummary: string;
  serviceTerms: string;
  trackingLink: string;
}

@Injectable()
export class PdfService {
  async renderServiceOrderPdf(input: RenderInput) {
    const html = `
      <html>
      <body style="font-family: Arial; padding: 24px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h1>Ordem de Serviço ${input.orderNumber}</h1>
          ${input.logoUrl ? `<img src="${input.logoUrl}" alt="logo" style="height:64px;"/>` : ''}
        </div>
        <p><strong>Empresa:</strong> ${input.companyName}</p>
        <p><strong>Cliente:</strong> ${input.customerName}</p>
        <p><strong>Equipamento(s):</strong> ${input.equipmentSummary}</p>
        <p><strong>Termos de entrada:</strong> ${input.serviceTerms}</p>
        <p><strong>Acompanhamento:</strong> <a href="${input.trackingLink}">${input.trackingLink}</a></p>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const folder = path.resolve(process.cwd(), 'generated');
    await fs.mkdir(folder, { recursive: true });
    const filename = `os-${input.orderNumber.replace('#', '')}.pdf`;
    const filePath = path.join(folder, filename);
    await fs.writeFile(filePath, pdfBuffer);

    return {
      filename,
      filePath,
      buffer: pdfBuffer,
      url: `${process.env.BACKEND_PUBLIC_URL || 'http://localhost:3001'}/generated/${filename}`,
    };
  }
}
