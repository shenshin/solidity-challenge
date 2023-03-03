interface RootstockTestnetToken {
  address: string;
  name: string;
  owner: string;
}

export const tokens: RootstockTestnetToken[] = [
  {
    owner: 'Antonio Carlo Dante Lottero',
    name: 'Tony Token 2',
    address: '0x8FFBF6BeD8E989688a9Bf15203697f87cb63dd2a',
  },
  {
    owner: 'Julia Zack',
    name: 'WorstSon',
    address: '0xe6DB6085d63396e386D18bd504e7b19D98e5cC59',
  },
  {
    owner: 'Alex Shenshin',
    name: 'MeowToken',
    address: '0x6470368c3536C125D5071f82C11Aa0e64F5e6763',
  },
  /*   {
    owner: 'Lucio Serra',
    name: 'LucioToken',
    address: '0x4D83b0cA87CfFd467e8B9f2C91aB02dCD7D46420',
  }, */
];
export default tokens;
