/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { main, wrapper, header, logoText, content, h1, text, quoteBox, quoteText, footerWrap, footer, brand } from './_styles.ts'

interface Props {
  user_name: string
  inquiry_type: string
  message?: string
}

export const InquiryConfirmationEmail = ({ user_name, inquiry_type, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your {inquiry_type} inquiry</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Container style={header}>
          <Text style={logoText}>{brand.siteName}</Text>
        </Container>
        <Container style={content}>
          <Heading style={h1}>Inquiry Received</Heading>
          <Text style={text}>Hi {user_name},</Text>
          <Text style={text}>Thank you for your <strong>{inquiry_type}</strong> inquiry. Our team will review it and get back to you within 24-48 hours.</Text>
          {message && (
            <Container style={quoteBox}>
              <Text style={quoteText}>"{message}"</Text>
            </Container>
          )}
          <Text style={text}>If you have additional questions, feel free to reply to this email or submit another inquiry through your dashboard.</Text>
        </Container>
        <Hr style={{ borderColor: '#e5e7eb', margin: '0' }} />
        <Container style={footerWrap}>
          <Text style={footer}>{brand.siteName} — {brand.tagline}</Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default InquiryConfirmationEmail
