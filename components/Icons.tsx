import React from 'react';
import {
  Activity,
  Archive,
  ArrowDown,
  ArrowUp,
  Bookmark,
  Brain,
  ChevronRight,
  Edit2,
  Heart,
  History,
  PencilLine,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  User,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const IconDo = (props: IconProps) => <Activity {...props} />;
export const IconBe = (props: IconProps) => <User {...props} />;
export const IconFeel = (props: IconProps) => <Heart {...props} />;
export const IconMagic = (props: IconProps) => <Sparkles {...props} />;
export const IconEdit = (props: IconProps) => <Edit2 {...props} />;
export const IconRefresh = (props: IconProps) => <RefreshCw {...props} />;
export const IconZoomIn = (props: IconProps) => <ZoomIn {...props} />;
export const IconZoomOut = (props: IconProps) => <ZoomOut {...props} />;
export const IconSave = (props: IconProps) => <Bookmark {...props} />;
export const IconTrash = (props: IconProps) => <Trash2 {...props} />;
export const IconAdd = (props: IconProps) => <Plus {...props} />;
export const IconClose = (props: IconProps) => <X {...props} />;
export const IconHistory = (props: IconProps) => <History {...props} />;
export const IconArrowUp = (props: IconProps) => <ArrowUp {...props} />;
export const IconArrowDown = (props: IconProps) => <ArrowDown {...props} />;
export const IconRegenerate = (props: IconProps) => <WandSparkles {...props} />;
export const IconBrain = (props: IconProps) => <Brain {...props} />;
export const IconArchive = (props: IconProps) => <Archive {...props} />;
export const IconChevronRight = (props: IconProps) => <ChevronRight {...props} />;
export const IconDraft = (props: IconProps) => <PencilLine {...props} />;
