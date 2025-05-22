import React, { useState } from 'react';
import styled from 'styled-components';
import { subnetCalculator } from '@ipv4-calc/core';
import { isValidCIDR, isValidIPv4 } from '@ipv4-calc/core';
import { SubnetInfo, SubnetCalculationResult, SubnetDetails } from '@ipv4-calc/core';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import SubnetTable from './components/SubnetTable';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: #2c3e50;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #7f8c8d;
    font-size: 1rem;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const App = () => {
  const [result, setResult] = useState<SubnetCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateSubnet = (
    networkAddress: string,
    subnetMask: string,
    hostCount: string,
    subnetCount: string
  ) => {
    setError(null);
    
    try {
      // IP 주소 유효성 검증
      if (!isValidIPv4(networkAddress)) {
        setError('유효하지 않은 네트워크 주소입니다.');
        return;
      }
      
      // 서브넷 마스크 유효성 검증
      if (!isValidIPv4(subnetMask)) {
        setError('유효하지 않은 서브넷 마스크입니다.');
        return;
      }
      
      // 기본 서브넷 계산
      let calculationResult: SubnetInfo = 
      subnetCalculator.calculate(networkAddress, subnetMask);
      
      // 서브넷 수가 지정된 경우 세부 서브넷 계산
      if (subnetCount && parseInt(subnetCount) > 0) {
        calculationResult = subnetCalculator.calculateSubnets(
          networkAddress,
          subnetMask,
          parseInt(subnetCount)
        );
      }
      
      setResult(calculationResult as SubnetCalculationResult);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <AppContainer>
      <Header>
        <h1>IPv4 서브넷 계산기</h1>
        <p>
          네트워크 주소 블록, 서브넷 마스크, 호스트/서브넷 수를 입력하여 서브넷 정보를 계산하세요.
        </p>
      </Header>
      
      <ContentContainer>
        <InputForm onCalculate={calculateSubnet} error={error} />
        
        {result && (
          <>
            <ResultDisplay result={result} />
            {result.subnetDetails && result.subnetDetails.length > 0 && (
              <SubnetTable subnets={result.subnetDetails} />
            )}
          </>
        )}
      </ContentContainer>
    </AppContainer>
  );
};

export default App; 