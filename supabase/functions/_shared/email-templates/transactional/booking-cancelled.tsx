/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'

interface BookingCancelledProps {
  user_name: string
  property_title: string
  booking_date: string
  cancellation_reason: string
}

export const BookingCancelledEmail = ({
  user_name, property_title, booking_date, cancellation_reason,
}: BookingCancelledProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your viewing of {property_title} has been cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Viewing Cancelled</Heading>
        <Text style={text}>Hi {user_name},</Text>
        <Text style={text}>
          Your viewing for <strong>{property_title}</strong> on {booking_date} has been cancelled.
        </Text>
        {cancellation_reason && (
          <Text style={text}><strong>Reason:</strong> {cancellation_reason}</Text>
        )}
        <Text style={text}>
          You can reschedule anytime from the property page or your dashboard.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Astra Villa Realty — Your gateway to premium Indonesian property.</Text>
      </Container>
    </Body>
  </Html>
)

export default BookingCancelledEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0d1f2d', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#5c6e7f', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
