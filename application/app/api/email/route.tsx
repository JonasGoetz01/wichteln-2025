import { Resend } from 'resend';
import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server'

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  await auth.protect()
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({
      message: 'User not found'
    }, { status: 404 })
  }
  const userEmail = user.emailAddresses[0]?.emailAddress
  if (userEmail !== 'jonas.goetz01@web.de' && userEmail !== 'jonas.goetz01@gmail.com') {
    return NextResponse.json({
      message: 'User not allowed'
    }, { status: 403 })
  }
  
  resend.emails.send({
    from: 'info@mail.goetz.sh',
    to: 'jonas.goetz01@web.de',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
  });

  return NextResponse.json({
    message: 'Email sent'
  });
}