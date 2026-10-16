import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  adSlot?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  fullWidthResponsive?: boolean;
  className?: string;
}

const AdSense: React.FC<AdSenseProps> = ({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  className = ""
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;

    const pushAd = () => {
      try {
        if (adRef.current) {
          // Check if ad container has width, otherwise AdSense will throw availableWidth=0 error
          if (adRef.current.offsetWidth === 0 && attempts < 10) {
            attempts++;
            timeoutId = setTimeout(pushAd, 100);
            return;
          }
          
          // Check if already initialized to prevent 'All ins elements... already have ads' error
          if (adRef.current.getAttribute('data-adsbygoogle-status') === 'done') {
            return;
          }
          
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e: any) {
        const errorMsg = e?.message || String(e);
        if (!errorMsg.includes('already have ads in them') && !errorMsg.includes('availableWidth=0')) {
          console.warn('AdSense notice:', errorMsg);
        }
      }
    };

    pushAd();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Use legitimate publisher ID
  const publisherId = "ca-pub-7108609286164560";
  const isValidSlot = adSlot && adSlot !== "1234567890" && /^\d{8,14}$/.test(adSlot);

  return (
    <div className={`my-6 overflow-hidden flex justify-center w-full min-h-[90px] ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px', width: '100%', textAlign: 'center' }}
        data-ad-client={publisherId}
        {...(isValidSlot ? { 'data-ad-slot': adSlot } : {})}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSense;
