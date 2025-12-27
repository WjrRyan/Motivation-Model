import React from 'react';
import { 
  Activity, 
  User, 
  Heart, 
  Sparkles, 
  Download, 
  Edit2, 
  RefreshCw,
  Share2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const IconDo = (props: IconProps) => <Activity {...props} />;
export const IconBe = (props: IconProps) => <User {...props} />;
export const IconFeel = (props: IconProps) => <Heart {...props} />;
export const IconMagic = (props: IconProps) => <Sparkles {...props} />;
export const IconDownload = (props: IconProps) => <Download {...props} />;
export const IconEdit = (props: IconProps) => <Edit2 {...props} />;
export const IconRefresh = (props: IconProps) => <RefreshCw {...props} />;
export const IconShare = (props: IconProps) => <Share2 {...props} />;
export const IconZoomIn = (props: IconProps) => <ZoomIn {...props} />;
export const IconZoomOut = (props: IconProps) => <ZoomOut {...props} />;