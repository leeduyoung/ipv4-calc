export interface IPv4Address {
  address: string;
  octets: number[];
  binaryOctets: string[];
  decimalValue: number;
}

export interface SubnetInfo {
  networkAddress: string;
  subnetMask: string;
  cidrNotation: string;
  wildcardMask: string;
  hostRange: {
    first: string;
    last: string;
  };
  broadcastAddress: string;
  numberOfHosts: number;
  numberOfSubnets: number;
}

export interface SubnetDetails {
  subnetId: number;
  subnetAddress: string;
  hostAddressRange: string;
  broadcastAddress: string;
}

export interface SubnetCalculationResult extends SubnetInfo {
  subnetDetails: SubnetDetails[];
} 