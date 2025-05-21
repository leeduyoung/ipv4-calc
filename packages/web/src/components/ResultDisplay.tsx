import React from 'react';
import styled from 'styled-components';
import { SubnetInfo } from '@ipv4-calc/core';

interface ResultDisplayProps {
  result: SubnetInfo;
}

const ResultContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
`;

const ResultTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ResultItem = styled.div`
  margin-bottom: 1rem;
  
  h3 {
    font-size: 1rem;
    color: #7f8c8d;
    margin: 0 0 0.3rem 0;
    font-weight: 500;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
    color: #34495e;
    font-weight: 500;
    word-break: break-all;
  }
`;

const ResultDisplay = ({ result }: ResultDisplayProps) => {
  return (
    <ResultContainer>
      <ResultTitle>서브넷 계산 결과</ResultTitle>
      <ResultGrid>
        <ResultItem>
          <h3>네트워크 주소</h3>
          <p>{result.networkAddress}</p>
        </ResultItem>
        
        <ResultItem>
          <h3>서브넷 마스크</h3>
          <p>{result.subnetMask}</p>
        </ResultItem>
        
        <ResultItem>
          <h3>CIDR 표기</h3>
          <p>{result.cidrNotation}</p>
        </ResultItem>
        
        <ResultItem>
          <h3>와일드카드 마스크</h3>
          <p>{result.wildcardMask}</p>
        </ResultItem>
        
        <ResultItem>
          <h3>호스트 주소 범위</h3>
          <p>{result.hostRange.first} - {result.hostRange.last}</p>
        </ResultItem>
        
        <ResultItem>
          <h3>브로드캐스트 주소</h3>
          <p>{result.broadcastAddress}</p>
        </ResultItem>
        
        <ResultItem>
          <h3>사용 가능한 호스트 수</h3>
          <p>{result.numberOfHosts.toLocaleString()}</p>
        </ResultItem>
        
        <ResultItem>
          <h3>서브넷 수</h3>
          <p>{result.numberOfSubnets.toLocaleString()}</p>
        </ResultItem>
      </ResultGrid>
    </ResultContainer>
  );
};

export default ResultDisplay; 