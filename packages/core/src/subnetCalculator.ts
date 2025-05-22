import { SubnetCalculationResult, SubnetDetails, SubnetInfo } from './types';
import {
  isValidIPv4,
  isValidCIDR,
  parseIPv4,
  cidrToSubnetMask,
  subnetMaskToCIDR,
  calculateWildcardMask,
  calculateNetworkAddress,
  calculateBroadcastAddress,
  calculateHostRange,
  calculateNumberOfHosts,
  addToIP
} from './ipUtils';

class SubnetCalculator {
  /**
   * CIDR 표기법으로부터 서브넷 정보를 계산합니다.
   */
  calculateFromCIDR(cidr: string): SubnetInfo {
    if (!isValidCIDR(cidr)) {
      throw new Error(`Invalid CIDR notation: ${cidr}`);
    }
    
    const [ipAddress, prefixStr] = cidr.split('/');
    const prefix = parseInt(prefixStr, 10);
    const subnetMask = cidrToSubnetMask(prefix);
    
    return this.calculate(ipAddress, subnetMask);
  }
  
  /**
   * IP 주소와 서브넷 마스크로부터 서브넷 정보를 계산합니다.
   */
  calculate(ipAddress: string, subnetMask: string): SubnetInfo {
    if (!isValidIPv4(ipAddress)) {
      throw new Error(`Invalid IP address: ${ipAddress}`);
    }
    
    if (!isValidIPv4(subnetMask)) {
      throw new Error(`Invalid subnet mask: ${subnetMask}`);
    }
    
    const cidr = subnetMaskToCIDR(subnetMask);
    const wildcardMask = calculateWildcardMask(subnetMask);
    const networkAddress = calculateNetworkAddress(ipAddress, subnetMask);
    const broadcastAddress = calculateBroadcastAddress(networkAddress, subnetMask);
    const hostRange = calculateHostRange(networkAddress, broadcastAddress);
    const numberOfHosts = calculateNumberOfHosts(cidr);
    
    // 네트워크 클래스 기반 서브넷 수 계산 (간단한 방법)
    let originalCIDR = 8; // Class A
    if (parseInt(networkAddress.split('.')[0], 10) >= 128) {
      originalCIDR = 16; // Class B
    }
    if (parseInt(networkAddress.split('.')[0], 10) >= 192) {
      originalCIDR = 24; // Class C
    }
    
    // 원래 클래스 접두사와 현재 접두사 간의 차이로 서브넷 수 계산
    const numberOfSubnets = Math.pow(2, cidr - originalCIDR);
    
    return {
      networkAddress,
      subnetMask,
      cidrNotation: `${networkAddress}/${cidr}`,
      wildcardMask,
      hostRange,
      broadcastAddress,
      numberOfHosts,
      numberOfSubnets
    };
  }
  
  /**
   * 네트워크 주소, 서브넷 마스크, 그리고 원하는 서브넷 수로부터 서브넷 세부 정보를 계산합니다.
   */
  calculateSubnets(
    networkAddress: string, 
    subnetMask: string, 
    desiredSubnets: number
  ): SubnetCalculationResult {
    const subnetInfo = this.calculate(networkAddress, subnetMask);
    const cidr = subnetMaskToCIDR(subnetMask);
    
    // 원하는 서브넷 수에 필요한 추가 비트 수 계산
    let additionalBits = Math.ceil(Math.log2(desiredSubnets));
    const newCIDR = cidr + additionalBits;
    
    if (newCIDR > 30) {
      throw new Error(`요청한 서브넷 수 (${desiredSubnets})가 너무 많습니다. 최대 CIDR은 /30입니다.`);
    }
    
    const newSubnetMask = cidrToSubnetMask(newCIDR);
    const subnetSize = Math.pow(2, 32 - newCIDR);
    
    // 세부 서브넷 계산
    const subnetDetails: SubnetDetails[] = [];
    const actualSubnets = Math.pow(2, additionalBits);
    
    for (let i = 0; i < actualSubnets; i++) {
      const subnetAddress = addToIP(networkAddress, i * subnetSize);
      const broadcastAddress = addToIP(subnetAddress, subnetSize - 1);
      const hostRange = `${addToIP(subnetAddress, 1)} - ${addToIP(broadcastAddress, -1)}`;
      
      subnetDetails.push({
        subnetId: i + 1,
        subnetAddress,
        hostAddressRange: hostRange,
        broadcastAddress
      });
    }
    
    return {
      ...subnetInfo,
      subnetDetails
    };
  }
  
  /**
   * 호스트 수를 기반으로 필요한 서브넷 마스크를 계산합니다.
   */
  calculateSubnetMaskFromHostCount(hostCount: number): string {
    // 호스트 수를 수용하기 위해 필요한 비트 수
    const hostBits = Math.ceil(Math.log2(hostCount + 2)); // 네트워크 및 브로드캐스트 주소 포함
    const cidr = 32 - hostBits;
    
    if (cidr < 0) {
      throw new Error('요청한 호스트 수가 IPv4에서 지원하는 최대 범위를 초과합니다.');
    }
    
    return cidrToSubnetMask(cidr);
  }
}

export const subnetCalculator = new SubnetCalculator();