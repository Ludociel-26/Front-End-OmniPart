import React, { memo } from 'react';
import {
  Box,
  ColumnLayout,
  Link,
  StatusIndicator,
  BarChart,
  AreaChart,
  PieChart,
  Table,
  SpaceBetween,
  Icon
} from '@cloudscape-design/components';
import type { WidgetConfig } from '../interfaces';

// --- WRAPPER OPTIMIZADO PARA EL LAYOUT ---
// Este componente evita que el contenido interno "salte" visualmente al arrastrar
const WidgetWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    {children}
  </div>
);

// --- 1. Service Overview ---
export const ServiceOverview = memo(() => (
  <WidgetWrapper>
    <ColumnLayout columns={4} variant="text-grid">
      <div><Box variant="awsui-key-label">Running instances</Box><Link href="#" variant="awsui-value-large" fontSize="display-l">14</Link></div>
      <div><Box variant="awsui-key-label">Volumes</Box><Link href="#" variant="awsui-value-large" fontSize="display-l">126</Link></div>
      <div><Box variant="awsui-key-label">Security groups</Box><Link href="#" variant="awsui-value-large" fontSize="display-l">116</Link></div>
      <div><Box variant="awsui-key-label">Load balancers</Box><Link href="#" variant="awsui-value-large" fontSize="display-l">28</Link></div>
    </ColumnLayout>
  </WidgetWrapper>
));

// --- 2. Instance Hours ---
export const InstanceHours = memo(() => (
  <WidgetWrapper>
    <BarChart
      series={[
        { title: "On-demand", type: "bar", data: [{ x: "Jan", y: 450 }, { x: "Feb", y: 600 }, { x: "Mar", y: 550 }, { x: "Apr", y: 480 }, { x: "May", y: 620 }, { x: "Jun", y: 700 }] },
        { title: "Spot", type: "bar", data: [{ x: "Jan", y: 100 }, { x: "Feb", y: 120 }, { x: "Mar", y: 110 }, { x: "Apr", y: 90 }, { x: "May", y: 130 }, { x: "Jun", y: 150 }] }
      ]}
      xDomain={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
      yDomain={[0, 1000]}
      stackedBars
      fitHeight={true}
      hideFilter
      i18nStrings={{ legendAriaLabel: "Legend", chartAriaRoleDescription: "bar chart", yTickFormatter: (e) => `${e}` }}
    />
  </WidgetWrapper>
));

// --- 3. Network Traffic ---
const trafficDataX = [new Date(2023, 0, 1), new Date(2023, 0, 2), new Date(2023, 0, 3), new Date(2023, 0, 4), new Date(2023, 0, 5), new Date(2023, 0, 6)];
export const NetworkTraffic = memo(() => (
  <WidgetWrapper>
    <AreaChart
      series={[
        { title: "Inbound", type: "area", data: [{ x: trafficDataX[0], y: 120 }, { x: trafficDataX[1], y: 340 }, { x: trafficDataX[2], y: 220 }, { x: trafficDataX[3], y: 450 }, { x: trafficDataX[4], y: 380 }, { x: trafficDataX[5], y: 520 }] },
        { title: "Outbound", type: "area", data: [{ x: trafficDataX[0], y: 80 }, { x: trafficDataX[1], y: 150 }, { x: trafficDataX[2], y: 100 }, { x: trafficDataX[3], y: 200 }, { x: trafficDataX[4], y: 150 }, { x: trafficDataX[5], y: 250 }] }
      ]}
      xDomain={[trafficDataX[0], trafficDataX[5]]}
      yDomain={[0, 600]}
      fitHeight={true}
      hideFilter
      xScaleType="time"
      i18nStrings={{ legendAriaLabel: "Legend", chartAriaRoleDescription: "area chart" }}
    />
  </WidgetWrapper>
));

// --- 4. Service Health ---
export const ServiceHealth = memo(() => (
  <WidgetWrapper>
    <ColumnLayout columns={1}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><Link href="#">Amazon EC2</Link><StatusIndicator type="success">Normal</StatusIndicator></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><Link href="#">Amazon RDS</Link><StatusIndicator type="success">Normal</StatusIndicator></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><Link href="#">AWS Lambda</Link><StatusIndicator type="warning">Degraded</StatusIndicator></div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><Link href="#">Amazon S3</Link><StatusIndicator type="success">Normal</StatusIndicator></div>
    </ColumnLayout>
  </WidgetWrapper>
));

// --- 5. Zone Status ---
export const ZoneStatus = memo(() => (
  <WidgetWrapper>
    <PieChart
      data={[{ title: "Operating normally", value: 18, color: "#1D8102" }, { title: "Disrupted", value: 2, color: "#D13212" }]}
      detailPopoverContent={(datum, sum) => [{ key: "Status", value: datum.title }, { key: "Count", value: `${datum.value}` }, { key: "Percentage", value: `${((datum.value / sum) * 100).toFixed(0)}%` }]}
      segmentDescription={(datum, sum) => `${datum.value} zones, ${((datum.value / sum) * 100).toFixed(0)}%`}
      size="medium"
      variant="donut"
      hideLegend
      innerMetricDescription="zones"
      innerMetricValue="20"
      fitHeight={true}
    />
  </WidgetWrapper>
));

// --- 6. Events ---
export const Events = memo(() => (
  <WidgetWrapper>
    <Table
      columnDefinitions={[{ header: 'Event name', cell: item => item.name }, { header: 'Status', cell: item => <StatusIndicator type={item.status === 'Ongoing' ? 'success' : 'pending'}>{item.status}</StatusIndicator> }]}
      items={[{ name: 'my-instance-1', status: 'Scheduled' }, { name: 'my-instance-3', status: 'Ongoing' }, { name: 'db-production-1', status: 'Ongoing' }, { name: 'redis-cluster-a', status: 'Scheduled' }]}
      variant="embedded"
    />
  </WidgetWrapper>
));

// --- 7. Alarms ---
export const Alarms = memo(() => (
  <WidgetWrapper>
    <Table
      columnDefinitions={[{ header: 'Alarm name', cell: item => <Link href="#">{item.name}</Link> }, { header: 'Status', cell: item => <StatusIndicator type="warning">{item.status}</StatusIndicator> }]}
      items={[{ name: 'TargetTracking-table', status: 'In alarm' }, { name: 'awsroute53-check', status: 'In alarm' }, { name: 'awsdynamodb-read', status: 'Insufficient data' }]}
      variant="embedded"
    />
  </WidgetWrapper>
));

// --- 8. Features Spotlight ---
export const FeaturesSpotlight = memo(() => (
  <WidgetWrapper>
    <SpaceBetween size="s">
      <Box variant="p">Updates on features available in the current region.</Box>
      <Link href="#"><Icon name="external" /> See what's new</Link>
      <Link href="#"><Icon name="file" /> Read the blog</Link>
    </SpaceBetween>
  </WidgetWrapper>
));

// --- 9. Instance Limits ---
export const InstanceLimits = memo(() => (
  <WidgetWrapper>
    <ColumnLayout columns={2} variant="text-grid">
      <div><Box variant="awsui-key-label">On-Demand</Box><div style={{ fontSize: 20 }}>14</div></div>
      <div><Box variant="awsui-key-label">Spot</Box><div style={{ fontSize: 20 }}>2</div></div>
      <div><Box variant="awsui-key-label">vCPUs</Box><div style={{ fontSize: 20 }}>64</div></div>
    </ColumnLayout>
  </WidgetWrapper>
));

export const OperationalMetrics = memo(() => <Box>System healthy.</Box>);

// --- CONFIGURACIÓN ---
export const serviceOverview: WidgetConfig = { title: 'Service overview', provider: ServiceOverview, definition: { defaultColumnSpan: 4, defaultRowSpan: 2, minRowSpan: 2 } };
export const serviceHealth: WidgetConfig = { title: 'Service Health', provider: ServiceHealth, definition: { defaultColumnSpan: 2, defaultRowSpan: 2, minRowSpan: 2 } };
export const instanceHours: WidgetConfig = { title: 'Instance hours', provider: InstanceHours, definition: { defaultColumnSpan: 2, defaultRowSpan: 4, minRowSpan: 3 } };
export const networkTraffic: WidgetConfig = { title: 'Network traffic', provider: NetworkTraffic, definition: { defaultColumnSpan: 2, defaultRowSpan: 4, minRowSpan: 3 } };
export const zoneStatus: WidgetConfig = { title: 'Zone status', provider: ZoneStatus, definition: { defaultColumnSpan: 2, defaultRowSpan: 4, minRowSpan: 3 } };
export const events: WidgetConfig = { title: 'Events', provider: Events, definition: { defaultColumnSpan: 2, defaultRowSpan: 3 } };
export const alarms: WidgetConfig = { title: 'Alarms', provider: Alarms, definition: { defaultColumnSpan: 2, defaultRowSpan: 3 } };
export const featuresSpotlight: WidgetConfig = { title: 'Features spotlight', provider: FeaturesSpotlight, definition: { defaultRowSpan: 2 } };
export const instanceLimits: WidgetConfig = { title: 'Instance limits', provider: InstanceLimits, definition: { defaultColumnSpan: 2, defaultRowSpan: 2 } };
export const operationalMetrics: WidgetConfig = { title: 'Operational metrics', provider: OperationalMetrics, definition: { defaultRowSpan: 2 } };