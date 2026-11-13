import {
  BatteryCharging,
  Droplets,
  Flower2,
  Hand,
  Heart,
  Leaf,
  Lightbulb,
  ListChecks,
  type LucideIcon,
  Map,
  MapPin,
  MessageCircleQuestion,
  Package,
  Salad,
  Sprout,
  Wrench,
} from 'lucide-react'
import type { MessageIcon } from '../types'

/** Ícones que as assistentes podem usar nas mensagens */
export const MESSAGE_ICONS: Record<MessageIcon, LucideIcon> = {
  tip: Lightbulb,
  package: Package,
  battery: BatteryCharging,
  summary: ListChecks,
  leaf: Leaf,
  salad: Salad,
  water: Droplets,
  map: Map,
  location: MapPin,
  wave: Hand,
  question: MessageCircleQuestion,
  heart: Heart,
  flower: Flower2,
  wrench: Wrench,
  sprout: Sprout,
}
