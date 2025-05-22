#!/usr/bin/env node

import { Command } from 'commander';
import { table } from 'table';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
  subnetCalculator, 
  isValidCIDR, 
  isValidIPv4, 
  cidrToSubnetMask, 
  calculateNumberOfHosts,
  subnetMaskToCIDR 
} from '@ipv4-calc/core';

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

      const result = subnetCalculator.calculateFromCIDR(cidr);
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

      const result = subnetCalculator.calculate(ip, mask);
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

      const result = subnetCalculator.calculateSubnets(ip, mask, numSubnets);
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

      const mask = subnetCalculator.calculateSubnetMaskFromHostCount(hostCount);
      console.log(chalk.green(`${hostCount}개의 호스트를 수용하는 서브넷 마스크: ${mask}`));
    } catch (error) {
      console.error(chalk.red(`오류: ${(error as Error).message}`));
    }
  });

// CIDR 표기법으로부터 사용 가능한 서브넷 마스크 목록 표시 명령 추가
program
  .command('cidr-masks <cidr>')
  .description('CIDR 표기법으로부터 사용 가능한 서브넷 마스크 목록과 호스트/서브넷 수 표시')
  .action((cidr: string) => {
    try {
      if (!isValidCIDR(cidr)) {
        console.error(chalk.red(`오류: 유효하지 않은 CIDR 표기법입니다: ${cidr}`));
        console.log(chalk.yellow('올바른 형식: 192.168.1.0/24'));
        return;
      }

      const [ipAddress, cidrPrefixStr] = cidr.split('/');
      const originalCidrPrefix = parseInt(cidrPrefixStr, 10);
      
      console.log(chalk.bold.blue(`\n===== ${cidr}에 대한 서브넷 마스크 옵션 =====\n`));
      
      const data = [
        [
          chalk.bold('서브넷 마스크'),
          chalk.bold('CIDR'),
          chalk.bold('최대 호스트 수'),
          chalk.bold('서브넷 수')
        ]
      ];
      
      // 현재 CIDR부터 /30까지의 서브넷 마스크 목록 생성
      for (let i = originalCidrPrefix; i <= 30; i++) {
        const mask = cidrToSubnetMask(i);
        const hosts = calculateNumberOfHosts(i);
        const subnets = Math.pow(2, i - originalCidrPrefix);
        
        data.push([
          mask,
          `/${i}`,
          hosts.toLocaleString(),
          subnets.toLocaleString()
        ]);
      }
      
      console.log(table(data));
      
      // 원래 CIDR에 대한 세부 정보 표시
      const originalResult = subnetCalculator.calculateFromCIDR(cidr);
      console.log(chalk.green(`원본 네트워크에 대한 정보:`));
      displaySubnetInfo(originalResult);
      
    } catch (error) {
      console.error(chalk.red(`오류: ${(error as Error).message}`));
    }
  });

// 대화형 인터페이스 명령 추가
program
  .command('interactive')
  .alias('i')
  .description('대화형 모드로 서브넷 계산기 실행')
  .action(async () => {
    try {
      // 네트워크 주소 블록(CIDR) 입력 받기
      const { cidrInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'cidrInput',
          message: '네트워크 주소 블록(CIDR)을 입력하세요:',
          default: '10.0.0.0/16',
          validate: (input: string) => {
            if (isValidCIDR(input)) {
              return true;
            }
            return '유효한 CIDR 표기법을 입력하세요 (예: 192.168.1.0/24)';
          }
        }
      ]);

      const [ipAddress, cidrPrefixStr] = cidrInput.split('/');
      const originalCidrPrefix = parseInt(cidrPrefixStr, 10);
      
      // 선택 가능한 서브넷 마스크 목록 생성
      const maskOptions = [];
      for (let i = originalCidrPrefix; i <= 30; i++) {
        const mask = cidrToSubnetMask(i);
        const hosts = calculateNumberOfHosts(i);
        const subnets = Math.pow(2, i - originalCidrPrefix);
        
        maskOptions.push({
          name: `${mask} (/${i}) - 호스트: ${hosts.toLocaleString()}, 서브넷: ${subnets.toLocaleString()}`,
          value: {
            mask,
            cidr: i,
            hosts,
            subnets
          }
        });
      }
      
      // 서브넷 마스크 선택
      const { selectedMask } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedMask',
          message: '서브넷 마스크를 선택하세요:',
          choices: maskOptions,
          pageSize: 15
        }
      ]);
      
      // 원본 네트워크의 기본 정보 표시
      console.log(chalk.bold.blue(`\n===== 네트워크 주소: ${ipAddress} =====\n`));
      console.log(chalk.cyan(`서브넷 마스크: ${selectedMask.mask} (/${selectedMask.cidr})`));
      console.log(chalk.cyan(`최대 호스트 수: ${selectedMask.hosts.toLocaleString()}`));
      console.log(chalk.cyan(`서브넷 수: ${selectedMask.subnets.toLocaleString()}`));
      
      // 자세한 서브넷 계산 결과 표시
      const result = subnetCalculator.calculate(ipAddress, selectedMask.mask);
      displaySubnetInfo(result);
      
      // 서브넷 상세 정보 자동으로 계산하여 표시
      if (selectedMask.subnets > 1 && selectedMask.subnets <= 16) {
        // 서브넷 수가 적당할 때만 자동으로 모든 서브넷 세부 정보 표시
        console.log(chalk.yellow(`\n${selectedMask.subnets}개의 사용 가능한 서브넷 상세 정보:`));
        const subnetDetailResult = subnetCalculator.calculateSubnets(ipAddress, selectedMask.mask, selectedMask.subnets);
        displaySubnetDetails(subnetDetailResult.subnetDetails);
      } else if (selectedMask.subnets > 16) {
        // 서브넷 수가 많을 때는 사용자에게 물어봄
        const { showSubnetDetails } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'showSubnetDetails',
            message: `${selectedMask.subnets}개의 서브넷 세부 정보를 표시하시겠습니까?`,
            default: false
          }
        ]);
        
        if (showSubnetDetails) {
          const { limitSubnets } = await inquirer.prompt([
            {
              type: 'input',
              name: 'limitSubnets',
              message: '표시할 서브넷 수를 입력하세요 (전체를 보려면 0):',
              default: '16',
              validate: (input: string) => {
                const count = parseInt(input, 10);
                if (isNaN(count) || count < 0) {
                  return '0 이상의 정수를 입력하세요';
                }
                return true;
              }
            }
          ]);
          
          const limit = parseInt(limitSubnets, 10);
          const subnetCount = limit === 0 ? selectedMask.subnets : Math.min(limit, selectedMask.subnets);
          const subnetDetailResult = subnetCalculator.calculateSubnets(ipAddress, selectedMask.mask, subnetCount);
          displaySubnetDetails(subnetDetailResult.subnetDetails);
        }
      }
      
      // 서브넷 분할 옵션 제공
      const { wantSubnets } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'wantSubnets',
          message: '이 네트워크를 여러 서브넷으로 분할하시겠습니까?',
          default: false
        }
      ]);
      
      if (wantSubnets) {
        const { subnetCount } = await inquirer.prompt([
          {
            type: 'input',
            name: 'subnetCount',
            message: '원하는 서브넷 수를 입력하세요:',
            default: '4',
            validate: (input: string) => {
              const count = parseInt(input, 10);
              if (isNaN(count) || count <= 0) {
                return '양수를 입력하세요';
              }
              return true;
            }
          }
        ]);
        
        const count = parseInt(subnetCount, 10);
        const subnetResult = subnetCalculator.calculateSubnets(ipAddress, selectedMask.mask, count);
        displaySubnetDetails(subnetResult.subnetDetails);
      }
      
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

// 인자가 없는 경우 대화형 모드 실행
if (process.argv.length <= 2) {
  program.parse(['node', 'ipv4-calc', 'interactive']);
} else {
  program.parse(process.argv);
} 