/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'

interface VerificationApprovedProps {
  user_name: string
  verification_type: string
}

export const VerificationApprovedEmail = ({
  user_name, verification_type,
}: VerificationApprovedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {verification_type} verification is approved</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verification Approved ✓</Heading>
        <Text style={text}>Hi {user_name},</Text>
        <Text style={text}>
          Great news! Your <strong>{verification_type}</strong> verification has been approved. You now have access to all verified features.
        </Text>
        <Text style={text}>
          Thank you for completing the verification process. Your account has been upgraded accordingly.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Astra Villa Realty — Your gateway to premium Indonesian property.</Text>
      </Container>
    </Body>
  </Html>
)

export default VerificationApprovedEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0d1f2d', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#5c6e7f', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
