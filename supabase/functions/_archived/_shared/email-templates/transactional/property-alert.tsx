/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { main, wrapper, header, logoText, content, h1, text, detailsBox, detailLabel, detailValue, button, footerWrap, footer, brand } from './_styles.ts'

interface Props {
  user_name: string
  property_title: string
  property_location: string
  property_price: string
  property_type: string
  property_url?: string
  alert_type?: string
}

export const PropertyAlertEmail = ({ user_name, property_title, property_location, property_price, property_type, property_url, alert_type }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{alert_type === 'price_drop' ? `Price drop on ${property_title}` : `New listing: ${property_title}`}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Container style={header}>
          <Text style={logoText}>{brand.siteName}</Text>
        </Container>
        <Container style={content}>
          <Heading style={h1}>{alert_type === 'price_drop' ? '📉 Price Drop Alert' : '🏠 New Property Match'}</Heading>
          <Text style={text}>Hi {user_name},</Text>
          <Text style={text}>
            {alert_type === 'price_drop'
              ? `Great news! A property you're watching just dropped in price.`
              : `A new property matching your search criteria has been listed.`}
          </Text>
          <Container style={detailsBox}>
            <Text style={detailLabel}>Property</Text>
            <Text style={detailValue}>{property_title}</Text>
            <Text style={detailLabel}>Location</Text>
            <Text style={detailValue}>{property_location}</Text>
            <Text style={detailLabel}>Price</Text>
            <Text style={detailValue}>{property_price}</Text>
            <Text style={detailLabel}>Type</Text>
            <Text style={{ ...detailValue, margin: '0' }}>{property_type}</Text>
          </Container>
          {property_url && <Button style={button} href={property_url}>View Property</Button>}
        </Container>
        <Hr style={{ borderColor: '#e5e7eb', margin: '0' }} />
        <Container style={footerWrap}>
          <Text style={footer}>{brand.siteName} — {brand.tagline}</Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default PropertyAlertEmail
