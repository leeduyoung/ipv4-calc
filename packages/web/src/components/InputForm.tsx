import React, { useState } from 'react';
import styled from 'styled-components';

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
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
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
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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
`;

const InputForm = ({ onCalculate, error }: InputFormProps) => {
  const [networkAddress, setNetworkAddress] = useState('10.0.0.0');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [hostCount, setHostCount] = useState('');
  const [subnetCount, setSubnetCount] = useState('');
  
  const commonSubnetMasks = [
    { value: '255.0.0.0', label: '255.0.0.0/8' },
    { value: '255.255.0.0', label: '255.255.0.0/16' },
    { value: '255.255.255.0', label: '255.255.255.0/24' },
    { value: '255.255.255.128', label: '255.255.255.128/25' },
    { value: '255.255.255.192', label: '255.255.255.192/26' },
    { value: '255.255.255.224', label: '255.255.255.224/27' },
    { value: '255.255.255.240', label: '255.255.255.240/28' },
    { value: '255.255.255.248', label: '255.255.255.248/29' },
    { value: '255.255.255.252', label: '255.255.255.252/30' }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(networkAddress, subnetMask, hostCount, subnetCount);
  };
  
  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <label htmlFor="networkAddress">네트워크 주소 블록</label>
            <input
              id="networkAddress"
              type="text"
              value={networkAddress}
              onChange={(e) => setNetworkAddress(e.target.value)}
              placeholder="예: 192.168.1.0"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="subnetMask">서브넷 마스크</label>
            <select
              id="subnetMask"
              value={subnetMask}
              onChange={(e) => setSubnetMask(e.target.value)}
              required
            >
              {commonSubnetMasks.map((mask) => (
                <option key={mask.value} value={mask.value}>
                  {mask.label}
                </option>
              ))}
            </select>
          </FormGroup>
        </FormRow>
        
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
        
        <CalculateButton type="submit">계산하기</CalculateButton>
      </form>
    </FormContainer>
  );
};

export default InputForm; 