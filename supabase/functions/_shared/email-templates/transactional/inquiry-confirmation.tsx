/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'

interface InquiryConfirmationProps {
  user_name: string
  inquiry_type: string
  message?: string
}

export const InquiryConfirmationEmail = ({
  user_name, inquiry_type, message,
}: InquiryConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your {inquiry_type} inquiry</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Inquiry Received</Heading>
        <Text style={text}>Hi {user_name},</Text>
        <Text style={text}>
          Thank you for your <strong>{inquiry_type}</strong> inquiry. Our team will review it and get back to you within 24-48 hours.
        </Text>
        {message && (
          <Container style={quoteBox}>
            <Text style={quoteText}>"{message}"</Text>
          </Container>
        )}
        <Text style={text}>
          If you have additional questions, feel free to reply to this email or submit another inquiry through your dashboard.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Astra Villa Realty — Your gateway to premium Indonesian property.</Text>
      </Container>
    </Body>
  </Html>
)

export default InquiryConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0d1f2d', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#5c6e7f', lineHeight: '1.6', margin: '0 0 16px' }
const quoteBox = { backgroundColor: '#f0f9ff', borderLeft: '3px solid #00A3F5', borderRadius: '0 10px 10px 0', padding: '16px 20px', margin: '0 0 20px' }
const quoteText = { fontSize: '14px', color: '#0d1f2d', lineHeight: '1.6', margin: '0', fontStyle: 'italic' as const }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
