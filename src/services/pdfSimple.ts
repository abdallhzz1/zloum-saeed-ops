import { Machine, Section } from '@/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const generateSimplePDF = async (
  title: string,
  content: { label: string; value: string }[]
): Promise<void> => {
  // Create a simple HTML report
  const reportHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Cairo', Arial, sans-serif;
          direction: rtl;
          text-align: right;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #0891B2;
          font-size: 32px;
          text-align: center;
          margin-bottom: 30px;
        }
        .section {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 15px;
        }
        .label {
          font-weight: bold;
          color: #0891B2;
          margin-bottom: 5px;
        }
        .value {
          color: #333;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${content.map(item => `
        <div class="section">
          <div class="label">${item.label}</div>
          <div class="value">${item.value}</div>
        </div>
      `).join('')}
      <div style="text-align: center; color: #666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p>تم إنشاء التقرير في ${format(new Date(), 'PPpp', { locale: ar })}</p>
      </div>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateMachineReportSimple = async (machine: Machine): Promise<void> => {
  const content = [
    { label: 'اسم الآلة', value: machine.name },
    { label: 'الكود', value: machine.code },
    { label: 'الحالة', value: machine.state === 'Working' ? 'تعمل' : machine.state === 'Stopped' ? 'متوقفة' : 'تحتاج صيانة' },
    { label: 'آخر صيانة', value: machine.lastMaintenanceDate ? format(new Date(machine.lastMaintenanceDate), 'PPP', { locale: ar }) : 'لا يوجد' },
  ];

  await generateSimplePDF(`تقرير الآلة - ${machine.name}`, content);
};

export const generateSectionReportSimple = async (section: Section, machineCount: number): Promise<void> => {
  const content = [
    { label: 'اسم القسم', value: section.name },
    { label: 'الوصف', value: section.description || 'لا يوجد' },
    { label: 'عدد الآلات', value: machineCount.toString() },
    { label: 'تاريخ الإنشاء', value: format(new Date(section.createdAt), 'PPP', { locale: ar }) },
  ];

  await generateSimplePDF(`تقرير القسم - ${section.name}`, content);
};
