/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'

interface BookingConfirmationProps {
  user_name: string
  property_title: string
  booking_date: string
  booking_time: string
  property_address: string
}

export const BookingConfirmationEmail = ({
  user_name, property_title, booking_date, booking_time, property_address,
}: BookingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your viewing of {property_title} is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Viewing Confirmed</Heading>
        <Text style={text}>Hi {user_name},</Text>
        <Text style={text}>
          Your property viewing has been confirmed. Here are the details:
        </Text>
        <Container style={detailsBox}>
          <Text style={detailLabel}>Property</Text>
          <Text style={detailValue}>{property_title}</Text>
          <Text style={detailLabel}>Date & Time</Text>
          <Text style={detailValue}>{booking_date} at {booking_time}</Text>
          <Text style={detailLabel}>Address</Text>
          <Text style={detailValue}>{property_address}</Text>
        </Container>
        <Text style={text}>
          Please arrive 5 minutes early. If you need to reschedule, visit your dashboard.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Astra Villa Realty — Your gateway to premium Indonesian property.</Text>
      </Container>
    </Body>
  </Html>
)

export default BookingConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0d1f2d', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#5c6e7f', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f0f9ff', borderRadius: '10px', padding: '20px', margin: '0 0 20px' }
const detailLabel = { fontSize: '11px', color: '#5c6e7f', textTransform: 'uppercase' as const, margin: '0 0 2px', fontWeight: '600' as const, letterSpacing: '0.5px' }
const detailValue = { fontSize: '15px', color: '#0d1f2d', margin: '0 0 14px', fontWeight: '500' as const }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
