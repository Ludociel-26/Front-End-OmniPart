// CORREGIDO: Agregamos "type" antes de { SideNavigationProps }
import type { SideNavigationProps } from '@cloudscape-design/components/side-navigation';

export const navItems: SideNavigationProps.Item[] = [
  {
    type: 'link',
    text: 'Dashboard',
    href: '#/dashboard'
  },
  {
    type: 'section',
    text: 'Instances',
    items: [
      { type: 'link', text: 'Instances', href: '#/instances' },
      { type: 'link', text: 'Launch templates', href: '#/launch-templates' },
      { type: 'link', text: 'Spot requests', href: '#/spot' },
      { type: 'link', text: 'Reserved instances', href: '#/reserved' },
    ]
  },
  {
    type: 'section',
    text: 'Images',
    items: [
      { type: 'link', text: 'AMIs', href: '#/amis' },
      { type: 'link', text: 'AMI Catalog', href: '#/ami-catalog' },
    ]
  },
  {
    type: 'section',
    text: 'Network & Security',
    items: [
      { type: 'link', text: 'Security Groups', href: '#/security-groups' },
      { type: 'link', text: 'Elastic IPs', href: '#/elastic-ips' },
    ]
  },
  { type: 'divider' },
  {
    type: 'link',
    text: 'Settings',
    href: '#/settings'
  }
];