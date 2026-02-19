
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Send, Save, Globe } from 'lucide-react';
import { useSocialMediaSettings } from '@/hooks/useSocialMediaSettings';

const fields = [
  {
    key: 'facebookUrl' as const,
    label: 'Facebook URL',
    icon: Facebook,
    placeholder: 'https://facebook.com/yourpage',
    color: 'text-blue-500',
  },
  {
    key: 'twitterUrl' as const,
    label: 'Twitter / X URL',
    icon: Twitter,
    placeholder: 'https://twitter.com/yourhandle',
    color: 'text-sky-400',
  },
  {
    key: 'instagramUrl' as const,
    label: 'Instagram URL',
    icon: Instagram,
    placeholder: 'https://instagram.com/yourprofile',
    color: 'text-pink-500',
  },
  {
    key: 'linkedinUrl' as const,
    label: 'LinkedIn URL',
    icon: Linkedin,
    placeholder: 'https://linkedin.com/company/yourcompany',
    color: 'text-blue-600',
  },
  {
    key: 'youtubeUrl' as const,
    label: 'YouTube URL',
    icon: Youtube,
    placeholder: 'https://youtube.com/@yourchannel',
    color: 'text-red-500',
  },
  {
    key: 'whatsappNumber' as const,
    label: 'WhatsApp Number',
    icon: MessageCircle,
    placeholder: '+6285716008080',
    color: 'text-green-500',
  },
  {
    key: 'telegramUrl' as const,
    label: 'Telegram URL / Username',
    icon: Send,
    placeholder: 'https://t.me/yourusername',
    color: 'text-sky-500',
  },
];

const SocialMediaSettings = () => {
  const { settings, isLoading, isSaving, updateSetting, saveSettings } = useSocialMediaSettings();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Social Media Links</CardTitle>
        </div>
        <CardDescription>
          Set your social media URLs here. These will appear as clickable icons in the website footer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {fields.map(({ key, label, icon: Icon, placeholder, color }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              {label}
            </Label>
            <Input
              id={key}
              value={settings[key]}
              onChange={(e) => updateSetting(key, e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className="font-mono text-sm"
            />
          </div>
        ))}

        <div className="pt-2 border-t border-border/40">
          <Button
            onClick={saveSettings}
            disabled={isLoading || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Social Media Links'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialMediaSettings;
