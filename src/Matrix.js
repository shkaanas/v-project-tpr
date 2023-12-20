import React, { useEffect, useState } from 'react';
import { Input } from '@nextui-org/react';
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import { Button } from '@nextui-org/react';
import { Tabs, Tab, Card, CardBody } from '@nextui-org/react';
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';

function Matrix({ x, y }) {
  const [step, setStep] = useState(0.01);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [showTabs, setShowTabs] = useState(false);

  const [value, setValue] = useState(0);
  const handleChange = (value) => setValue(value);

  const [matrix, setMatrix] = useState(() => {
    const initialMatrix = Array.from({ length: x }, () => Array(y).fill(0));
    return initialMatrix;
  });

  // Обробник події для зміни значення у комірці матриці
  const handleCellChange = (rowIndex, colIndex, newValue) => {
    if (newValue !== null) {
      console.log(rowIndex, colIndex, newValue);
      setMatrix((prevMatrix) => {
        const newMatrix = [...prevMatrix];
        newMatrix[rowIndex][colIndex] = newValue;
        return newMatrix;
      });
    }
  };
  const columnNames = matrix[0].map((col, index) => `y${index + 1}`);

  // Функція для обчислення максимакса для кожного рядка
  const calculateMaximax = () => {
    const maximaxes = matrix.map((row) => Math.max(...row));
    const overallMaximax = Math.max(...maximaxes);
    const overallMin = Math.min(...maximaxes);
    return { maximaxes, overallMaximax, overallMin };
  };

  const { maximaxes, overallMaximax, overallMin } = calculateMaximax();

  // Функція для обчислення мінімакса для кожного рядка
  const calculateMinimax = () => {
    const minimaxes = matrix.map((row) => Math.min(...row));
    const overallMinimax = Math.max(...minimaxes);
    return { minimaxes, overallMinimax };
  };

  const { minimaxes, overallMinimax } = calculateMinimax();

  // Функція для обчислення критерію Гурвіца для кожного рядка
  const calculateHurwicz = () => {
    const hurwiczes = matrix.map((row) => {
      const minValue = Math.min(...row);
      const maxValue = Math.max(...row);
      return value * maxValue + (1 - value) * minValue;
    });
    const overallHur = Math.max(...hurwiczes);
    return { hurwiczes, overallHur };
  };

  const { hurwiczes, overallHur } = calculateHurwicz();

  //Критерій Севіджа
  // Функція для обчислення найбільшого значення в кожному стовпці
  const calculateColumnMaxValues = () => {
    const columnMaxValues = Array(y).fill(Number.NEGATIVE_INFINITY);

    matrix.forEach((row) => {
      row.forEach((cell, colIndex) => {
        columnMaxValues[colIndex] = Math.max(columnMaxValues[colIndex], cell);
      });
    });

    return columnMaxValues;
  };

  // Функція для створення нової матриці, віднімаючи найбільше значення від кожного елемента
  const createModifiedMatrix = () => {
    const columnMaxValues = calculateColumnMaxValues();
    const modifiedMatrix = matrix.map((row) =>
      row.map((cell, colIndex) => columnMaxValues[colIndex] - cell)
    );

    const sev = modifiedMatrix.map((row) => Math.max(...row));
    const overallSev = Math.min(...sev);
    return { modifiedMatrix, overallSev };
  };

  const { modifiedMatrix, overallSev } = createModifiedMatrix();

  //В умовах ризику
  const [columnValues, setColumnValues] = useState(() =>
    Array(y).fill(Number.NEGATIVE_INFINITY)
  );
  // Обробник події для зміни значення у полі вводу стовпця
  const handleColumnInputChange = (colIndex, newValue) => {
    setError('');
    setColumnValues((prevValues) => {
      const newValues = [...prevValues];
      newValues[colIndex] = newValue;
      return newValues;
    });
  };

  const handleSubmit = () => {
    if (columnValues.some((value) => value === Number.NEGATIVE_INFINITY)) {
      setError('Заповніть всі поля');
      return;
    }
    const sum = columnValues.reduce((acc, value) => acc + parseFloat(value), 0);
    if (sum > 1) {
      setError('Сума значень стовпців не може бути більше 1.');
      setColumnValues(Array(y).fill(Number.NEGATIVE_INFINITY));
      return;
    }
    setShowResult(true);
  };
  const calculateBayes = () => {
    const bayes = matrix.map((row) =>
      row.map((cell, colIndex) => cell * columnValues[colIndex])
    );
    const overallBB = bayes.map((row) =>
      row.reduce((acc, value) => acc + value, 0)
    );
    const overallBayes = Math.max(...overallBB);
    return { bayes, overallBayes, overallBB };
  };

  const { bayes, overallBayes, overallBB } = calculateBayes();

  const calculateDispersion = () => {
    const dispersion = matrix.map((row) =>
      row.map((cell, colIndex) => cell * cell * columnValues[colIndex])
    );
    const overall = dispersion.map((row) =>
      row.reduce((acc, value) => acc + value, 0)
    );

    const overallPow = overall.map((row, rowIndex) =>
      Math.sqrt(row - overallBB[rowIndex] * overallBB[rowIndex]).toFixed(2)
    );
    // console.log(overallPow);
    const overallDispersion = Math.min(...overallPow);
    return { overallPow, overallDispersion };
  };

  const { overallPow, overallDispersion } = calculateDispersion();

  const findMinMaxValues = () => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    matrix.forEach((row) => {
      row.forEach((cell) => {
        min = Math.min(min, cell);
        max = Math.max(max, cell);
      });
    });

    return { min, max };
  };

  const { min, max } = findMinMaxValues();
  const [value2, setValue2] = useState(min);
  const handleChange2 = (value2) => setValue2(value2);

  // Функція для обчислення оцінок за критерієм максимізації ймовірності
  const calculateEstimatedProbabilities = () => {
    const chosenValue = value2;
    const newProbabilities = matrix.map((row) => {
      const rowProbability = row.reduce((acc, value) => {
        if (chosenValue <= value) {
          parseFloat(acc);
          acc += parseFloat(columnValues[row.indexOf(value)]);
        }
        return acc;
      }, 0);
      return rowProbability.toFixed(2);
    });

    const overallProb = Math.max(...newProbabilities);
    return { newProbabilities, overallProb };
  };

  const { newProbabilities, overallProb } = calculateEstimatedProbabilities();

  // Критерій модальний
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnValuesInMatrix, setColumnValuesInMatrix] = useState([]);
  const [modalErr, setModalErr] = useState('');
  const calculateModalCriterion = () => {
    setModalErr('');
    const maxProbability = Math.max(...columnValues);
    const maxProbabilityIndices = columnValues.reduce(
      (indices, value, index) =>
        value == maxProbability ? [...indices, index] : indices,
      []
    );

    if (maxProbabilityIndices.length === 1) {
      const columnIndex = maxProbabilityIndices[0];
      setSelectedColumn(columnIndex);

      const valuesInSelectedColumn = matrix.map((row) => row[columnIndex]);
      setColumnValuesInMatrix(valuesInSelectedColumn);
    } else {
      setModalErr('У даному випадку критерій не може бути застосований');
    }
  };

  useEffect(() => {
    calculateModalCriterion();
  }, [showResult]);
  return (
    <div className="column gap-4">
      <div className="column gap-4 ">
        <TableContainer>
          <Table variant="simple">
            <Thead>
              {columnNames.map((name, index) => (
                <Th key={index}>
                  <p className="text-md">{name}</p>
                </Th>
              ))}
            </Thead>
            <Tbody>
              {matrix.map((row, rowIndex) => (
                <Tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <Td key={colIndex}>
                      <Input
                        type="number"
                        value={cell}
                        width="70px"
                        size="sm"
                        variant="filled"
                        onChange={(e) =>
                          handleCellChange(rowIndex, colIndex, +e.target.value)
                        }
                      />
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Button onClick={() => setShowTabs(true)}>Результат</Button>
      </div>
      {showTabs && (
        <>
          <div className="flex flex-col column column_better">
            <Tabs aria-label="Options">
              <Tab key="photos" title="Умови ризику">
                <Card>
                  <CardBody>
                    <div className="card2 ">
                      <h2 className="text-large font-semibold leading-none text-default-600">
                        Введіть імовірності
                      </h2>
                      {columnValues.map((value, colIndex) => (
                        <Input
                          size="sm"
                          className="mar"
                          key={colIndex}
                          type="number"
                          step={step}
                          min={0}
                          max={1}
                          value={value}
                          onChange={(e) =>
                            handleColumnInputChange(colIndex, e.target.value)
                          }
                        />
                      ))}
                      {error && <p color="red">{error}</p>}

                      <Button
                        onClick={handleSubmit}
                        colorScheme="teal"
                        variant="solid"
                        className="mt-5"
                      >
                        Підтвердити
                      </Button>
                    </div>
                    {showResult && (
                      <>
                        <div className="card2 ">
                          <h2 className="text-large font-semibold leading-none text-default-600">
                            Критерій Байєсса «максимізації прибутку»
                          </h2>
                          {bayes.map((row, rowIndex) => (
                            <p pt="2" fontSize="md" key={rowIndex}>
                              Z{rowIndex + 1}:{' '}
                              {row.reduce((acc, value) => acc + value, 0)}
                            </p>
                          ))}

                          <p pt="2" fontSize="md">
                            Максимальне значення: {overallBayes}
                          </p>
                        </div>

                        <div className="card2 ">
                          <h2 className="text-large font-semibold leading-none text-default-600">
                            Критерій мінімізації дисперсії
                          </h2>
                          {overallPow.map((row, rowIndex) => (
                            <p pt="2" fontSize="md" key={rowIndex}>
                              Z{rowIndex + 1}: {row}
                            </p>
                          ))}

                          <p pt="2" fontSize="md">
                            Мінімальне значення: {overallDispersion}
                          </p>
                        </div>

                        <div className="card2 ">
                          <h2 className="text-large font-semibold leading-none text-default-600">
                            Критерій максимізації ймовірності розподілу оцінок
                          </h2>
                          <Slider
                            flex="1"
                            min={min}
                            max={max}
                            focusThumbOnChange={false}
                            value={value2}
                            onChange={handleChange2}
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb
                              fontSize="md"
                              boxSize="32px"
                              children={value2}
                            />
                          </Slider>
                          {newProbabilities.map((row, rowIndex) => (
                            <p pt="2" fontSize="md" key={rowIndex}>
                              Z{rowIndex + 1}: {row}
                            </p>
                          ))}

                          <p pt="2" fontSize="md">
                            Максимальне значення: {overallProb}
                          </p>
                        </div>

                        <div className="card2 ">
                          <h2 className="text-large font-semibold leading-none text-default-600">
                            Критерій модальний
                          </h2>
                          {modalErr ? (
                            <>
                              <p pt="2" fontSize="md">
                                {modalErr}
                              </p>
                            </>
                          ) : (
                            <>
                              <p pt="2" fontSize="md">
                                p0 = p{selectedColumn + 1} ={' '}
                                {columnValues[selectedColumn]}
                              </p>
                              {columnValuesInMatrix.map((row, rowIndex) => (
                                <p pt="2" fontSize="md" key={rowIndex}>
                                  Z{rowIndex + 1}: {row}
                                </p>
                              ))}

                              <p pt="2" fontSize="md">
                                Максимальне значення:{' '}
                                {Math.max(...columnValuesInMatrix)}
                              </p>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>
              </Tab>
              <Tab key="music" title="Умови невизначеності">
                <Card>
                  <CardBody>
                    <div className="card2">
                      <h2 className="text-large font-semibold leading-none text-default-600">
                        Критерій "максимакса"
                      </h2>
                      {maximaxes.map((max, index) => (
                        <p pt="2" fontSize="md" key={index}>
                          Z{index + 1}: {max}
                        </p>
                      ))}
                      <p pt="2" fontSize="md">
                        Максимальне значення: {overallMaximax}
                      </p>
                    </div>

                    <div className="card2">
                      <h2 className="text-large font-semibold leading-none text-default-600">
                        Мінімаксний критерій
                      </h2>
                      {minimaxes.map((min, index) => (
                        <p pt="2" fontSize="md" key={index}>
                          Z{index + 1}: {min}
                        </p>
                      ))}
                      <p pt="2" fontSize="md">
                        Максимум з мінімумів: {overallMinimax}
                      </p>
                      {maximaxes.map((max, index) => (
                        <p pt="2" fontSize="md" key={index}>
                          Z{index + 1}: {max}
                        </p>
                      ))}
                      <p pt="2" fontSize="md">
                        Мінімум з максимусів: {overallMin}
                      </p>
                    </div>

                    <div className="card2">
                      <h2 className="text-large font-semibold leading-none text-default-600">
                        Критерій Гурвіца
                      </h2>
                      <Slider
                        flex="1"
                        step={step}
                        min={0}
                        max={1}
                        focusThumbOnChange={false}
                        value={value}
                        onChange={handleChange}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb
                          fontSize="md"
                          boxSize="32px"
                          children={value}
                        />
                      </Slider>
                      {hurwiczes.map((hurwicz, index) => (
                        <p pt="2" fontSize="md" key={index}>
                          Z{index + 1}: {hurwicz}
                        </p>
                      ))}
                      <p pt="2" fontSize="md">
                        Максимальне значення: {overallHur}
                      </p>
                    </div>

                    <div className="card2">
                      <h2 className="text-large font-semibold leading-none text-default-600">
                        Критерій Севіджа
                      </h2>
                      <TableContainer>
                        <Table variant="simple">
                          <Tbody>
                            {modifiedMatrix.map((row, rowIndex) => (
                              <Tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                  <Td key={colIndex}>{cell}</Td>
                                ))}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                      <p pt="2" fontSize="md">
                        Мінімальне значення: {overallSev}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}

export default Matrix;
