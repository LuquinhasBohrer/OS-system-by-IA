import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  async renderServiceOrderPdf(serviceOrderId: string) {
    return {
      serviceOrderId,
      url: `https://storage.exemplo.com/os/${serviceOrderId}.pdf`,
    };
  }
}
