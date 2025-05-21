import { IPv4Address } from './types';

/**
 * IP 주소 문자열이 유효한지 확인합니다.
 */
export function isValidIPv4(ip: string): boolean {
  const pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return pattern.test(ip);
}

/**
 * CIDR 표기법이 유효한지 확인합니다.
 */
export function isValidCIDR(cidr: string): boolean {
  const parts = cidr.split('/');
  if (parts.length !== 2) return false;
  
  const ipStr = parts[0];
  const prefixStr = parts[1];
  
  if (!isValidIPv4(ipStr)) return false;
  
  const prefix = parseInt(prefixStr, 10);
  return !isNaN(prefix) && prefix >= 0 && prefix <= 32;
}

/**
 * IP 주소 문자열을 IPv4Address 객체로 파싱합니다.
 */
export function parseIPv4(ip: string): IPv4Address {
  if (!isValidIPv4(ip)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  
  const octets = ip.split('.').map(octet => parseInt(octet, 10));
  const binaryOctets = octets.map(octet => octet.toString(2).padStart(8, '0'));
  const decimalValue = 
    (octets[0] << 24) | 
    (octets[1] << 16) | 
    (octets[2] << 8) | 
    octets[3];
  
  return {
    address: ip,
    octets,
    binaryOctets,
    decimalValue
  };
}

/**
 * CIDR 표기법에서 서브넷 마스크를 반환합니다.
 */
export function cidrToSubnetMask(cidr: number): string {
  if (cidr < 0 || cidr > 32) {
    throw new Error(`Invalid CIDR prefix: ${cidr}`);
  }
  
  // 32비트 마스크를 생성 (전부 1)
  let mask = 0xffffffff;
  
  // cidr이 32가 아니면, 마스크의 하위 비트를 0으로 설정
  if (cidr < 32) {
    mask = mask << (32 - cidr);
  }
  
  // 마스크를 8비트 단위로 분리하여 IP 주소 형식으로 반환
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff
  ].join('.');
}

/**
 * 서브넷 마스크를 CIDR 접두사로 변환합니다.
 */
export function subnetMaskToCIDR(subnetMask: string): number {
  if (!isValidIPv4(subnetMask)) {
    throw new Error(`Invalid subnet mask: ${subnetMask}`);
  }
  
  const octets = subnetMask.split('.').map(octet => parseInt(octet, 10));
  let cidr = 0;
  
  for (const octet of octets) {
    // 각 옥텟의 1의 개수를 세어 CIDR에 더함
    let bits = octet;
    while (bits) {
      cidr += bits & 1;
      bits >>>= 1;
    }
  }
  
  return cidr;
}

/**
 * IP 주소를 이진 문자열로 변환합니다.
 */
export function ipToBinaryString(ip: string): string {
  return parseIPv4(ip).binaryOctets.join('');
}

/**
 * 서브넷 마스크의 와일드카드 마스크를 계산합니다.
 */
export function calculateWildcardMask(subnetMask: string): string {
  const octets = subnetMask.split('.').map(octet => parseInt(octet, 10));
  return octets.map(octet => 255 - octet).join('.');
}

/**
 * 네트워크 주소를 계산합니다.
 */
export function calculateNetworkAddress(ip: string, subnetMask: string): string {
  const ipOctets = ip.split('.').map(o => parseInt(o, 10));
  const maskOctets = subnetMask.split('.').map(o => parseInt(o, 10));
  
  return ipOctets.map((octet, index) => octet & maskOctets[index]).join('.');
}

/**
 * 브로드캐스트 주소를 계산합니다.
 */
export function calculateBroadcastAddress(networkAddress: string, subnetMask: string): string {
  const networkOctets = networkAddress.split('.').map(o => parseInt(o, 10));
  const maskOctets = subnetMask.split('.').map(o => parseInt(o, 10));
  const wildcardOctets = maskOctets.map(o => 255 - o);
  
  return networkOctets.map((octet, index) => octet | wildcardOctets[index]).join('.');
}

/**
 * 호스트 범위를 계산합니다.
 */
export function calculateHostRange(networkAddress: string, broadcastAddress: string): { first: string; last: string } {
  const networkOctets = networkAddress.split('.').map(o => parseInt(o, 10));
  const broadcastOctets = broadcastAddress.split('.').map(o => parseInt(o, 10));
  
  // 첫 번째 호스트 주소는 네트워크 주소 + 1
  const firstOctets = [...networkOctets];
  firstOctets[3] += 1;
  
  // 마지막 호스트 주소는 브로드캐스트 주소 - 1
  const lastOctets = [...broadcastOctets];
  lastOctets[3] -= 1;
  
  return {
    first: firstOctets.join('.'),
    last: lastOctets.join('.')
  };
}

/**
 * CIDR 접두사로부터 사용 가능한 호스트 수를 계산합니다.
 */
export function calculateNumberOfHosts(cidr: number): number {
  if (cidr >= 31) return cidr === 31 ? 2 : 1;
  return Math.pow(2, 32 - cidr) - 2; // 네트워크 주소와 브로드캐스트 주소 제외
}

/**
 * IP 주소에 정수를 더합니다.
 */
export function addToIP(ip: string, value: number): string {
  const parsed = parseIPv4(ip);
  const newDecimalValue = parsed.decimalValue + value;
  
  return [
    (newDecimalValue >>> 24) & 0xff,
    (newDecimalValue >>> 16) & 0xff,
    (newDecimalValue >>> 8) & 0xff,
    newDecimalValue & 0xff
  ].join('.');
}

/**
 * 두 IP 주소 간의 차이를 계산합니다.
 */
export function ipDifference(ip1: string, ip2: string): number {
  const parsed1 = parseIPv4(ip1);
  const parsed2 = parseIPv4(ip2);
  
  return Math.abs(parsed1.decimalValue - parsed2.decimalValue);
} 