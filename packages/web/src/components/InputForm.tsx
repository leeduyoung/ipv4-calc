import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  cidrToSubnetMask, 
  isValidCIDR, 
  calculateNumberOfHosts,
  subnetMaskToCIDR 
} from '@ipv4-calc/core';

interface InputFormProps {
  onCalculate: (
    networkAddress: string,
    subnetMask: string,
    hostCount: string,
    subnetCount: string
  ) => void;
  error: string | null;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0 1rem;
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #34495e;
    
    @media (max-width: 768px) {
      font-size: 0.95rem;
      margin-bottom: 0.3rem;
    }
  }
  
  input, select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.3s;
    
    &:focus {
      outline: none;
      border-color: #3498db;
    }
    
    @media (max-width: 768px) {
      padding: 0.6rem;
      font-size: 0.95rem;
    }
  }
`;

const InfoText = styled.div`
  color: #3498db;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-top: 0.3rem;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-top: 0.3rem;
  }
`;

const CalculateButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
  
  &:hover {
    background-color: #2980b9;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.7rem 1rem;
    font-size: 0.95rem;
    text-align: center;
  }
`;

const Spacer = styled.div`
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const InputForm = ({ onCalculate, error }: InputFormProps) => {
  const [networkCidr, setNetworkCidr] = useState('10.0.0.0/16');
  const [networkAddress, setNetworkAddress] = useState('10.0.0.0');
  const [subnetMask, setSubnetMask] = useState('255.255.0.0');
  const [hostCount, setHostCount] = useState('');
  const [subnetCount, setSubnetCount] = useState('');
  const [availableSubnetMasks, setAvailableSubnetMasks] = useState<Array<{value: string, label: string}>>([]);
  const [validCidr, setValidCidr] = useState(true);
  const [calculatedHostCount, setCalculatedHostCount] = useState<number>(0);
  const [calculatedSubnetCount, setCalculatedSubnetCount] = useState<number>(0);
  
  // CIDR에서 네트워크 주소와 서브넷 마스크 추출
  useEffect(() => {
    if (isValidCIDR(networkCidr)) {
      setValidCidr(true);
      const [ipAddress, cidrPrefix] = networkCidr.split('/');
      setNetworkAddress(ipAddress);
      
      const prefix = parseInt(cidrPrefix, 10);
      if (!isNaN(prefix) && prefix >= 0 && prefix <= 32) {
        const mask = cidrToSubnetMask(prefix);
        setSubnetMask(mask);
        
        // 사용 가능한 서브넷 마스크 목록 생성 (현재 CIDR 이상만 허용)
        const masks = [];
        for (let i = prefix; i <= 30; i++) {
          const newMask = cidrToSubnetMask(i);
          masks.push({
            value: newMask,
            label: `${newMask}/${i}`
          });
        }
        setAvailableSubnetMasks(masks);
        
        // 초기 호스트 수와 서브넷 수 계산
        calculateHostAndSubnetCount(mask, parseInt(cidrPrefix, 10));
      }
    } else {
      setValidCidr(false);
    }
  }, [networkCidr]);
  
  // 서브넷 마스크 변경 시 호스트 수와 서브넷 수 계산
  const calculateHostAndSubnetCount = (mask: string, originalCidr?: number) => {
    const subnetCidr = subnetMaskToCIDR(mask);
    const hosts = calculateNumberOfHosts(subnetCidr);
    setCalculatedHostCount(hosts);
    setHostCount(hosts.toString());
    
    // 서브넷 수 계산 (원래 CIDR과 선택한 서브넷 마스크의 CIDR 차이에 따라)
    if (originalCidr !== undefined) {
      const subnets = Math.pow(2, subnetCidr - originalCidr);
      setCalculatedSubnetCount(subnets);
      setSubnetCount(subnets.toString());
    }
  };
  
  const handleNetworkCidrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkCidr(e.target.value);
  };
  
  const handleSubnetMaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubnetMask = e.target.value;
    setSubnetMask(newSubnetMask);
    
    // 호스트 수와 서브넷 수 계산
    if (isValidCIDR(networkCidr)) {
      const cidrPrefix = parseInt(networkCidr.split('/')[1], 10);
      calculateHostAndSubnetCount(newSubnetMask, cidrPrefix);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(networkAddress, subnetMask, hostCount, subnetCount);
  };
  
  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <label htmlFor="networkCidr">네트워크 주소 블록 (CIDR)</label>
            <input
              id="networkCidr"
              type="text"
              value={networkCidr}
              onChange={handleNetworkCidrChange}
              placeholder="예: 192.168.1.0/24"
              required
            />
            {!validCidr && <ErrorMessage>유효하지 않은 CIDR 표기법입니다.</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="subnetMask">서브넷 마스크</label>
            <select
              id="subnetMask"
              value={subnetMask}
              onChange={handleSubnetMaskChange}
              required
              disabled={!validCidr}
            >
              {availableSubnetMasks.map((mask) => (
                <option key={mask.value} value={mask.value}>
                  {mask.label}
                </option>
              ))}
            </select>
          </FormGroup>
        </FormRow>
        
        <Spacer />
        
        <FormRow>
          <FormGroup>
            <label htmlFor="hostCount">호스트/서브넷 수</label>
            <input
              id="hostCount"
              type="number"
              value={hostCount}
              onChange={(e) => setHostCount(e.target.value)}
              placeholder="예: 1048576"
              min="1"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="subnetCount">서브넷 수</label>
            <input
              id="subnetCount"
              type="number"
              value={subnetCount}
              onChange={(e) => setSubnetCount(e.target.value)}
              placeholder="예: 16"
              min="1"
            />
          </FormGroup>
        </FormRow>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Spacer />
        <CalculateButton type="submit" disabled={!validCidr}>계산하기</CalculateButton>
      </form>
    </FormContainer>
  );
};

export default InputForm; 