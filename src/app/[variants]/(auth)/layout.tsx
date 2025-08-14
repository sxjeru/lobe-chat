import { PropsWithChildren } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

export const runtime = 'edge';

const Page = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox height={'100%'} width={'100%'}>
      <Center height={'100%'} width={'100%'}>
        {children}
      </Center>
    </Flexbox>
  );
};

export default Page;
