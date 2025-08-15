import { NextRequest } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();
    
    // 添加日志以便调试
    console.log('收到表单数据:', { name, email, message });
    console.log('RESEND_API_KEY是否存在:', !!process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'MSTech <onboarding@resend.dev>',
      to: ['799904657@qq.com'],
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}
Email: ${email}
Message: ${message}`,
      reply_to: email,
    });

    if (error) {
      console.error('发送邮件时出错:', error);
      return Response.json({ error }, { status: 500 });
    }

    console.log('邮件发送成功:', data);
    return Response.json(data);
  } catch (error) {
    console.error('API路由中的错误:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}