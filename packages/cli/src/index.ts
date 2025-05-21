#!/usr/bin/env node

import { Command } from 'commander';
import { table } from 'table';
import chalk from 'chalk';
import { SubnetCalculator, isValidCIDR, isValidIPv4 } from '@ipv4-calc/core';

const program = new Command();

// 프로그램 버전 및 설명 설정
program
  .name('ipv4-calc')
  .description('IPv4 서브넷 계산기 CLI')
  .version('1.0.0');

// CIDR 표기법으로 계산 명령 추가
program
  .command('cidr <cidr>')
  .description('CIDR 표기법(예: 192.168.1.0/24)으로 서브넷 정보 계산')
  .action((cidr: string) => {
    try {
      if (!isValidCIDR(cidr)) {
        console.error(chalk.red(`오류: 유효하지 않은 CIDR 표기법입니다: ${cidr}`));
        console.log(chalk.yellow('올바른 형식: 192.168.1.0/24'));
        return;
      }

      const result = SubnetCalculator.calculateFromCIDR(cidr);
      displaySubnetInfo(result);
    } catch (error) {
      console.error(chalk.red(`오류: ${(error as Error).message}`));
    }
  });

// IP 주소와 서브넷 마스크로 계산 명령 추가
program
  .command('subnet <ip> <mask>')
  .description('IP 주소와 서브넷 마스크로 서브넷 정보 계산')
  .action((ip: string, mask: string) => {
    try {
      if (!isValidIPv4(ip)) {
        console.error(chalk.red(`오류: 유효하지 않은 IP 주소입니다: ${ip}`));
        return;
      }

      if (!isValidIPv4(mask)) {
        console.error(chalk.red(`오류: 유효하지 않은 서브넷 마스크입니다: ${mask}`));
        return;
      }

      const result = SubnetCalculator.calculate(ip, mask);
      displaySubnetInfo(result);
    } catch (error) {
      console.error(chalk.red(`오류: ${(error as Error).message}`));
    }
  });

// IP, 마스크 및 서브넷 수로 세부 서브넷 계산 명령 추가
program
  .command('divide <ip> <mask> <subnets>')
  .description('네트워크를 지정된 서브넷 수로 분할')
  .action((ip: string, mask: string, subnets: string) => {
    try {
      if (!isValidIPv4(ip)) {
        console.error(chalk.red(`오류: 유효하지 않은 IP 주소입니다: ${ip}`));
        return;
      }

      if (!isValidIPv4(mask)) {
        console.error(chalk.red(`오류: 유효하지 않은 서브넷 마스크입니다: ${mask}`));
        return;
      }

      const numSubnets = parseInt(subnets, 10);
      if (isNaN(numSubnets) || numSubnets <= 0) {
        console.error(chalk.red(`오류: 유효하지 않은 서브넷 수입니다: ${subnets}`));
        return;
      }

      const result = SubnetCalculator.calculateSubnets(ip, mask, numSubnets);
      displaySubnetInfo(result);
      displaySubnetDetails(result.subnetDetails);
    } catch (error) {
      console.error(chalk.red(`오류: ${(error as Error).message}`));
    }
  });

// 호스트 수로 서브넷 마스크 계산 명령 추가
program
  .command('hosts <count>')
  .description('필요한 호스트 수를 수용할 서브넷 마스크 계산')
  .action((count: string) => {
    try {
      const hostCount = parseInt(count, 10);
      if (isNaN(hostCount) || hostCount <= 0) {
        console.error(chalk.red(`오류: 유효하지 않은 호스트 수입니다: ${count}`));
        return;
      }

      const mask = SubnetCalculator.calculateSubnetMaskFromHostCount(hostCount);
      console.log(chalk.green(`${hostCount}개의 호스트를 수용하는 서브넷 마스크: ${mask}`));
    } catch (error) {
      console.error(chalk.red(`오류: ${(error as Error).message}`));
    }
  });

// 서브넷 정보 표시 함수
function displaySubnetInfo(info: any) {
  console.log(chalk.bold.blue('\n===== 서브넷 정보 =====\n'));

  const data = [
    [chalk.bold('항목'), chalk.bold('값')],
    ['네트워크 주소', info.networkAddress],
    ['서브넷 마스크', info.subnetMask],
    ['CIDR 표기', info.cidrNotation],
    ['와일드카드 마스크', info.wildcardMask],
    ['호스트 주소 범위', `${info.hostRange.first} - ${info.hostRange.last}`],
    ['브로드캐스트 주소', info.broadcastAddress],
    ['사용 가능한 호스트 수', info.numberOfHosts.toLocaleString()],
    ['서브넷 수', info.numberOfSubnets.toLocaleString()]
  ];

  console.log(table(data));
}

// 서브넷 세부 정보 표시 함수
function displaySubnetDetails(details: any[]) {
  if (!details || details.length === 0) return;

  console.log(chalk.bold.blue('\n===== 서브넷 세부 정보 =====\n'));

  const data = [
    [
      chalk.bold('서브넷 ID'),
      chalk.bold('서브넷 주소'),
      chalk.bold('호스트 주소 범위'),
      chalk.bold('브로드캐스트 주소')
    ],
    ...details.map(subnet => [
      subnet.subnetId.toString(),
      subnet.subnetAddress,
      subnet.hostAddressRange,
      subnet.broadcastAddress
    ])
  ];

  console.log(table(data));
}

// 인자가 없는 경우 기본 명령으로 도움말 표시
if (process.argv.length <= 2) {
  program.help();
}

// 프로그램 실행
program.parse(process.argv); 