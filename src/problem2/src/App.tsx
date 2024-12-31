import { useState, useEffect, useCallback } from "react";
import { TokenPrice, Token } from "./types";

function App() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [inputAmount, setInputAmount] = useState<string>("");
  const [outputAmount, setOutputAmount] = useState<string>("");
  const [selectedInputToken, setSelectedInputToken] = useState<Token | null>(
    null
  );
  const [selectedOutputToken, setSelectedOutputToken] = useState<Token | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);
  const [error, setError] = useState<string>("");

  const fetchPrices = async () => {
    try {
      const response = await fetch(
        "https://interview.switcheo.com/prices.json"
      );
      const data = await response.json();
      // Filter out tokens without prices and sort by currency
      const validPrices = data
        .filter((price: TokenPrice) => price.price > 0)
        .sort((a: TokenPrice, b: TokenPrice) =>
          a.currency.localeCompare(b.currency)
        );
      setPrices(validPrices);
    } catch {
      setError("Failed to fetch token prices");
    }
  };

  const TokenIcon = ({ symbol }: { symbol: string }) => (
    <img
      src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`}
      alt={symbol}
      className="w-5 h-5"
      onError={(e) => {
        e.currentTarget.src = `https://via.placeholder.com/20/2d3748/FFFFFF?text=${symbol[0]}`;
      }}
    />
  );

  const calculateOutputAmount = useCallback((input: string) => {
    if (!selectedInputToken || !selectedOutputToken || !input) {
      setOutputAmount("");
      return;
    }

    if (selectedInputToken.symbol === selectedOutputToken.symbol) {
      setError("Cannot swap same tokens");
      setOutputAmount("");
      return;
    }

    const inputPrice =
      prices.find((p) => p.currency === selectedInputToken.symbol)?.price || 0;
    const outputPrice =
      prices.find((p) => p.currency === selectedOutputToken.symbol)?.price || 0;

    if (inputPrice && outputPrice) {
      const result = (Number(input) * inputPrice) / outputPrice;
      setOutputAmount(result.toFixed(6));
    }
  }, [prices, selectedInputToken, selectedOutputToken]);


  const isFormValid = () => {
    return (
      inputAmount &&
      Number(inputAmount) > 0 &&
      selectedInputToken &&
      selectedOutputToken &&
      selectedInputToken.symbol !== selectedOutputToken.symbol
    );
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Please check your input");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      resetForm();
    } catch {
      setError("Swap failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setInputAmount("");
    setOutputAmount("");
    setError("");
  };

  const TokenSelect = ({
    value,
    onChange,
    label,
  }: {
    value: Token | null;
    onChange: (token: Token | null) => void;
    label: string;
  }) => (
    <div className="relative flex-1 min-w-[120px]">
      <select
        className="appearance-none bg-gray-700 text-white p-2 rounded-lg w-full text-sm pr-2"
        value={value ? JSON.stringify(value) : ""}
        onChange={(e) => {
                const newToken = e.target.value ? JSON.parse(e.target.value) : null;
                if (
                  newToken &&
                  (selectedInputToken?.symbol === newToken.symbol ||
                    selectedOutputToken?.symbol === newToken.symbol)
                ) {
                  setError("Cannot select the same token");
                  return;
                }
                onChange(newToken);
                setError("");
                // Recalculate output amount when token is selected
                if (newToken) {
                  calculateOutputAmount(inputAmount);
                }
              }}
      >
        <option value="">{label}</option>
        {prices.map((price, index) => (
          <option
            key={`${price.currency}-${index}`}
            value={JSON.stringify({ symbol: price.currency })}
            className="flex items-center justify-end"
          >
            {price.currency}
          </option>
        ))}
      </select>
      {value && (
        <div className="absolute right-7 top-1/2 transform -translate-y-1/2">
          {" "}
          <TokenIcon symbol={value.symbol} />
        </div>
      )}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );

    useEffect(() => {
      fetchPrices();
    }, []);

    useEffect(() => {
      calculateOutputAmount(inputAmount);
    }, [
      calculateOutputAmount,
      inputAmount,
      selectedInputToken,
      selectedOutputToken,
    ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-xl w-[440px] shadow-xl border border-gray-700">
        <h1 className="text-xl font-bold text-white mb-4">Swap Tokens</h1>
        <form onSubmit={handleSwap} className="space-y-4">
          {showSuccess && (
            <div className="bg-green-500/20 text-green-400 p-2 rounded-lg text-xs mb-4">
              Swap completed successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 text-red-400 p-2 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          <div className="space-y-1">
            {" "}
            <label className="text-gray-300 text-xs">Amount to send</label>{" "}
            <div className="bg-gray-700 rounded-lg p-3 flex items-center gap-3">
              {" "}
              <input
                id="input-amount"
                type="number"
                value={inputAmount}
                onChange={(e) => {
                  setInputAmount(e.target.value);
                  calculateOutputAmount(e.target.value);
                }}
                className="bg-transparent text-white text-lg w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
                min="0"
                step="any"
              />
              <TokenSelect
                value={selectedInputToken}
                onChange={setSelectedInputToken}
                label="Select token"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
              onClick={() => {
                const temp = selectedInputToken;
                setSelectedInputToken(selectedOutputToken);
                setSelectedOutputToken(temp);
                setInputAmount(outputAmount);
                setOutputAmount(inputAmount);
              }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 text-xs">Amount to receive</label>
            <div className="bg-gray-700 rounded-lg p-3 flex items-center gap-3">
              <input
                id="output-amount"
                type="number"
                value={outputAmount}
                readOnly
                className="bg-transparent text-white text-lg w-full outline-none"
                placeholder="0.0"
              />
              <TokenSelect
                value={selectedOutputToken}
                onChange={setSelectedOutputToken}
                label="Select token"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
              isLoading || !isFormValid()
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Swap Tokens"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
