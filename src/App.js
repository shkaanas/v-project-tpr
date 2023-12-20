import './styles.scss';
import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import Matrix from './Matrix';
import { Button } from '@nextui-org/react';

function App() {
  const [showTable, setShowTable] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  function onlyNum() {
    if (x > 1 && y > 1) setShowTable(true);
  }
  return (
    <div className="main">
      <div className="flex flex-col gap-2">
        <div className="flex w-full flex-wrap items-end md:flex-nowrap mb-6 md:mb-0 gap-4">
          {showTable ? (
            <>
              <Matrix x={x} y={y} />
            </>
          ) : (
            <>
              <div className="flex card gap-4">
                <Input
                 
                  min={1}
                  max={20}
                  type="number"
                  label="Введіть x"
                  labelPlacement="outside"
                  placeholder="Введіть x"
                  onChange={(e) => setX(+e.target.value)}
                />
                <Input
                
                  min={1}
                  max={20}
                  type="number"
                  label="Введіть y"
                  labelPlacement="outside"
                  placeholder="Введіть y"
                  onChange={(e) => setY(+e.target.value)}
                />
              </div>
              <Button onClick={onlyNum} size="md" color="primary" variant="bordered">
                Підтвердити
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
