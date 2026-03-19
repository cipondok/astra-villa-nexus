/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { main, wrapper, header, logoText, content, h1, text, footerWrap, footer, brand } from './_styles.ts'

interface Props {
  user_name: string
  verification_type: string
}

export const VerificationApprovedEmail = ({ user_name, verification_type }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {verification_type} verification is approved</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Container style={header}>
          <Text style={logoText}>{brand.siteName}</Text>
        </Container>
        <Container style={content}>
          <Heading style={h1}>Verification Approved ✓</Heading>
          <Text style={text}>Hi {user_name},</Text>
          <Text style={text}>Great news! Your <strong>{verification_type}</strong> verification has been approved. You now have access to all verified features.</Text>
          <Text style={text}>Thank you for completing the verification process. Your account has been upgraded accordingly.</Text>
        </Container>
        <Hr style={{ borderColor: '#e5e7eb', margin: '0' }} />
        <Container style={footerWrap}>
          <Text style={footer}>{brand.siteName} — {brand.tagline}</Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default VerificationApprovedEmail
