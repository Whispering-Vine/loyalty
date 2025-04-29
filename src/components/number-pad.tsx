// src/components/NumberPad.tsx
import React from 'react';
import { Button } from "@/components/ui/button";

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export function NumberPad({ value, onChange, }: NumberPadProps) {
  const handleNumberClick = (num: string) => {
    if (value.length < 10) {
      onChange(value + num);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace']
  ];

  return (
    <div className="w-full bg-muted/20 rounded-2xl pt-4">
        <div className="grid grid-cols-3 gap-3">
          {numbers.map((row, i) => (
            <React.Fragment key={i}>
              {row.map((num) => (
                <Button
                  key={num}
                  variant={num === 'clear' || num === 'backspace' ? 'secondary' : 'outline'}
                  className={`h-20 text-2xl transition-all hover:scale-95 ${num === 'clear' || num === 'backspace' ? 'text-primary' : ''}`}
                  onClick={() => {
                    if (num === 'backspace') {
                      handleBackspace();
                    } else if (num === 'clear') {
                      handleClear();
                    } else {
                      handleNumberClick(num);
                    }
                  }}
                >
                  {num === 'backspace' ? '⌫' : num === 'clear' ? '×' : num}
                </Button>
              ))}
            </React.Fragment>
          ))}
        </div>

    </div>
  );
}