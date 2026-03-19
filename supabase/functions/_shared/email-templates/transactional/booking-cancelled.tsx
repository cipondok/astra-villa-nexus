/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { main, wrapper, header, logoText, content, h1, text, footerWrap, footer, brand } from './_styles.ts'

interface Props {
  user_name: string
  property_title: string
  booking_date: string
  cancellation_reason: string
}

export const BookingCancelledEmail = ({ user_name, property_title, booking_date, cancellation_reason }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your viewing of {property_title} has been cancelled</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Container style={header}>
          <Text style={logoText}>{brand.siteName}</Text>
        </Container>
        <Container style={content}>
          <Heading style={h1}>Viewing Cancelled</Heading>
          <Text style={text}>Hi {user_name},</Text>
          <Text style={text}>Your viewing for <strong>{property_title}</strong> on {booking_date} has been cancelled.</Text>
          {cancellation_reason && <Text style={text}><strong>Reason:</strong> {cancellation_reason}</Text>}
          <Text style={text}>You can reschedule anytime from the property page or your dashboard.</Text>
        </Container>
        <Hr style={{ borderColor: '#e5e7eb', margin: '0' }} />
        <Container style={footerWrap}>
          <Text style={footer}>{brand.siteName} — {brand.tagline}</Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default BookingCancelledEmail
