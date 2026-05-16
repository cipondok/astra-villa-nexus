// Device fingerprinting utility
export const generateDeviceFingerprint = async (): Promise<string> => {
  const components: string[] = [];

  // Browser information
  components.push(navigator.userAgent);
  components.push(navigator.language);
  components.push(String(screen.colorDepth));
  components.push(`${screen.width}x${screen.height}`);
  components.push(String(new Date().getTimezoneOffset()));

  // Available plugins
  if (navigator.plugins) {
    const plugins = Array.from(navigator.plugins)
      .map((p) => p.name)
      .join(',');
    components.push(plugins);
  }

  // Canvas fingerprinting (lightweight)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 100, 50);
      ctx.fillStyle = '#069';
      ctx.fillText('Device ID', 2, 15);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    console.error('Canvas fingerprinting failed:', e);
  }

  // Combine all components and hash
  const fingerprint = components.join('|');
  
  // Simple hash function (in production, use a proper crypto hash)
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(fingerprint)
  );
  
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  
  // Detect device type
  let deviceType = 'desktop';
  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

  // Detect browser
  let browserName = 'Unknown';
  let browserVersion = '';
  
  if (ua.includes('Firefox')) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('Chrome')) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('Safari')) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('Edge')) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/(\d+\.\d+)/)?.[1] || '';
  }

  // Detect OS
  let osName = 'Unknown';
  let osVersion = '';
  
  if (ua.includes('Windows')) {
    osName = 'Windows';
    osVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('Mac OS')) {
    osName = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (ua.includes('Linux')) {
    osName = 'Linux';
  } else if (ua.includes('Android')) {
    osName = 'Android';
    osVersion = ua.match(/Android (\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('iOS')) {
    osName = 'iOS';
    osVersion = ua.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || '';
  }

  return {
    deviceType,
    browserName,
    browserVersion,
    osName,
    osVersion,
  };
};
