import React from 'react';
import styled from 'styled-components';
import { SubnetDetails } from '@ipv4-calc/core';

interface SubnetTableProps {
  subnets: SubnetDetails[];
}

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  tr:hover {
    background-color: #eef2f7;
  }
`;

const TableTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
`;

const SubnetTable = ({ subnets }: SubnetTableProps) => {
  if (!subnets || subnets.length === 0) {
    return null;
  }
  
  return (
    <div>
      <TableTitle>서브넷 상세 정보</TableTitle>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>서브넷 ID</th>
              <th>서브넷 주소</th>
              <th>호스트 주소 범위</th>
              <th>브로드캐스트 주소</th>
            </tr>
          </thead>
          <tbody>
            {subnets.map((subnet) => (
              <tr key={subnet.subnetId}>
                <td>{subnet.subnetId}</td>
                <td>{subnet.subnetAddress}</td>
                <td>{subnet.hostAddressRange}</td>
                <td>{subnet.broadcastAddress}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SubnetTable; 