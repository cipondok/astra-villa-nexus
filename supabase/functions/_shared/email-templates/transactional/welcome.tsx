/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { main, wrapper, header, logoText, content, h1, text, button, footerWrap, footer, brand } from './_styles.ts'

interface Props {
  user_name: string
  dashboard_url?: string
}

export const WelcomeEmail = ({ user_name, dashboard_url }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {brand.siteName}!</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Container style={header}>
          <Text style={logoText}>{brand.siteName}</Text>
        </Container>
        <Container style={content}>
          <Heading style={h1}>Welcome aboard, {user_name}! 🏡</Heading>
          <Text style={text}>We're thrilled to have you join our community of property enthusiasts. Here's what you can do next:</Text>
          <Text style={text}>
            <strong>🔍 Browse Properties</strong> — Explore thousands of premium listings across Indonesia.<br />
            <strong>📋 Save Favorites</strong> — Shortlist properties you love for easy comparison.<br />
            <strong>📅 Book Viewings</strong> — Schedule visits directly with property owners.
          </Text>
          {dashboard_url && (
            <Button style={button} href={dashboard_url}>Explore Properties</Button>
          )}
        </Container>
        <Hr style={{ borderColor: '#e5e7eb', margin: '0' }} />
        <Container style={footerWrap}>
          <Text style={footer}>{brand.siteName} — {brand.tagline}</Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail
