/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { main, wrapper, header, logoText, content, h1, text, detailsBox, detailLabel, detailValue, footerWrap, footer, brand } from './_styles.ts'

interface Props {
  user_name: string
  property_title: string
  booking_date: string
  booking_time: string
  property_address: string
}

export const BookingConfirmationEmail = ({ user_name, property_title, booking_date, booking_time, property_address }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your viewing of {property_title} is confirmed</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Container style={header}>
          <Text style={logoText}>{brand.siteName}</Text>
        </Container>
        <Container style={content}>
          <Heading style={h1}>Viewing Confirmed ✓</Heading>
          <Text style={text}>Hi {user_name},</Text>
          <Text style={text}>Your property viewing has been confirmed. Here are the details:</Text>
          <Container style={detailsBox}>
            <Text style={detailLabel}>Property</Text>
            <Text style={detailValue}>{property_title}</Text>
            <Text style={detailLabel}>Date & Time</Text>
            <Text style={detailValue}>{booking_date} at {booking_time}</Text>
            <Text style={detailLabel}>Address</Text>
            <Text style={detailValue}>{property_address}</Text>
          </Container>
          <Text style={text}>Please arrive 5 minutes early. If you need to reschedule, visit your dashboard.</Text>
        </Container>
        <Hr style={{ borderColor: '#e5e7eb', margin: '0' }} />
        <Container style={footerWrap}>
          <Text style={footer}>{brand.siteName} — {brand.tagline}</Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default BookingConfirmationEmail
