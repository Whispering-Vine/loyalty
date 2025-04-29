"use client";

import { FormMessages } from "@/components/form-messages";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { fetcher } from "@/utils/fetcher";
import { Delete, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";

import { Command as CommandPrimitive } from "cmdk";

export interface AddressType {
	address1: string;
	address2: string;
	formattedAddress: string;
	city: string;
	region: string;
	postalCode: string;
	country: string;
	lat: number;
	lng: number;
}

interface AddressAutoCompleteProps {
	address: AddressType;
	setAddress: (address: AddressType) => void;
	searchInput: string;
	setSearchInput: (searchInput: string) => void;
	dialogTitle: string;
	showInlineError?: boolean;
	placeholder?: string;
}

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
	const {
		address,
		setAddress,
		showInlineError = true,
		searchInput,
		setSearchInput,
		placeholder,
	} = props;

	const [selectedPlaceId, setSelectedPlaceId] = useState("");
	// const [isOpen, setIsOpen] = useState(false);

	const { data } = useSWR(
		selectedPlaceId ? `/api/address/place?placeId=${selectedPlaceId}` : null,
		fetcher,
		{ revalidateOnFocus: false }
	);

	useEffect(() => {
		if (data?.data.address) {
			const addr = data.data.address as AddressType;
			setAddress(addr);

			// When selecting an autocomplete, format nicely
			const formatted = `${addr.address1}${addr.address2 ? ` ${addr.address2},` : ","} ${addr.city}, ${addr.region} ${addr.postalCode}, ${addr.country}`;
			setSearchInput(formatted);
		}
	}, [data, setAddress, setSearchInput]);

	return (
		<>
			{selectedPlaceId !== "" || address.formattedAddress ? (
				<div className="flex items-center gap-2">
					<Input value={address?.formattedAddress || ""} readOnly />

					<Button
						type="reset"
						onClick={() => {
							setSelectedPlaceId("");
							setAddress({
								address1: "",
								address2: "",
								formattedAddress: "",
								city: "",
								region: "",
								postalCode: "",
								country: "",
								lat: 0,
								lng: 0,
							});
							setSearchInput("");
						}}
						size="icon"
						variant="outline"
						className="shrink-0"
					>
						<Delete className="size-4" />
					</Button>
				</div>
			) : (
				<AddressAutoCompleteInput
					searchInput={searchInput}
					setSearchInput={setSearchInput}
					selectedPlaceId={selectedPlaceId}
					setSelectedPlaceId={setSelectedPlaceId}
					setIsOpenDialog={() => {}}
					showInlineError={showInlineError}
					placeholder={placeholder}
					setAddress={setAddress}
				/>
			)}
		</>
	);
}

interface CommonProps {
	selectedPlaceId: string;
	setSelectedPlaceId: (placeId: string) => void;
	setIsOpenDialog: (isOpen: boolean) => void;
	showInlineError?: boolean;
	searchInput: string;
	setSearchInput: (searchInput: string) => void;
	placeholder?: string;
	setAddress: (address: AddressType) => void;
}

function AddressAutoCompleteInput(props: CommonProps) {
	const {
		setSelectedPlaceId,
		selectedPlaceId,
		setIsOpenDialog,
		showInlineError,
		searchInput,
		setSearchInput,
		placeholder,
		setAddress,
	} = props;

	const [isOpen, setIsOpen] = useState(false);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Escape") close();
	};

	const debouncedSearchInput = useDebounce(searchInput, 500);
	const { data, isLoading } = useSWR(
		debouncedSearchInput ? `/api/address/autocomplete?input=${debouncedSearchInput}` : null,
		fetcher
	);

	const predictions = data?.data || [];

	// Hidden refs
	const line1Ref = useRef<HTMLInputElement>(null);
	const cityRef = useRef<HTMLInputElement>(null);
	const regionRef = useRef<HTMLInputElement>(null);
	const postalRef = useRef<HTMLInputElement>(null);
	const countryRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const checkAutofill = () => {
			const line1 = line1Ref.current?.value || "";
			const city = cityRef.current?.value || "";
			const region = regionRef.current?.value || "";
			const postal = postalRef.current?.value || "";
			const country = countryRef.current?.value || "";

			if (line1 && city && region && postal && country) {
				const formatted = `${line1}, ${city}, ${region} ${postal}, ${country}`;
				setSearchInput(formatted);
				setAddress({
					address1: line1,
					address2: "",
					formattedAddress: formatted,
					city,
					region,
					postalCode: postal,
					country,
					lat: 0,
					lng: 0,
				});
				setIsOpen(false);
			}
		};

		const interval = setInterval(checkAutofill, 500);
		return () => clearInterval(interval);
	}, [setAddress, setSearchInput]);

	return (
		<Command shouldFilter={false} onKeyDown={handleKeyDown} className="overflow-visible">
			<div className="flex w-full items-center justify-between rounded-lg border bg-background ring-offset-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 relative">

				{/* Hidden autofill fields */}
				<input ref={line1Ref} name="address-line1" autoComplete="address-line1" className="absolute opacity-0 w-0 h-0 pointer-events-none" tabIndex={-1} aria-hidden="true" />
				<input ref={cityRef} name="address-level2" autoComplete="address-level2" className="absolute opacity-0 w-0 h-0 pointer-events-none" tabIndex={-1} aria-hidden="true" />
				<input ref={regionRef} name="address-level1" autoComplete="address-level1" className="absolute opacity-0 w-0 h-0 pointer-events-none" tabIndex={-1} aria-hidden="true" />
				<input ref={postalRef} name="postal-code" autoComplete="postal-code" className="absolute opacity-0 w-0 h-0 pointer-events-none" tabIndex={-1} aria-hidden="true" />
				<input ref={countryRef} name="country" autoComplete="country" className="absolute opacity-0 w-0 h-0 pointer-events-none" tabIndex={-1} aria-hidden="true" />

				<CommandPrimitive.Input
					autoComplete="street-address"
					name="address"
					inputMode="text"
					value={searchInput}
					onValueChange={setSearchInput}
					onBlur={close}
					onFocus={open}
					placeholder={placeholder || "Enter address"}
					className="w-full py-1 px-3 rounded-md outline-none h-9"
				/>
			</div>

			{searchInput !== "" && !isOpen && !selectedPlaceId && showInlineError && (
				<FormMessages
					type="error"
					className="pt-1 text-sm"
					messages={["Select a valid address from the list"]}
				/>
			)}

			{isOpen && (
				<div className="relative animate-in fade-in-0 zoom-in-95 h-auto">
					<CommandList>
						<div className="absolute top-1.5 z-50 w-full">
							<CommandGroup className="relative h-auto z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md bg-background">
								{isLoading ? (
									<div className="h-28 flex items-center justify-center">
										<Loader2 className="size-6 animate-spin" />
									</div>
								) : (
									predictions.map((prediction: { placePrediction: { placeId: string; place: string; text: { text: string } } }) => (
										<CommandPrimitive.Item
											key={prediction.placePrediction.placeId}
											value={prediction.placePrediction.text.text}
											onSelect={() => {
												setSearchInput(prediction.placePrediction.text.text);
												setSelectedPlaceId(prediction.placePrediction.place);
												setIsOpenDialog(true);
												close();
											}}
											className="flex select-text flex-col cursor-pointer gap-0.5 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-start"
											onMouseDown={(e) => e.preventDefault()}
										>
											{prediction.placePrediction.text.text}
										</CommandPrimitive.Item>
									))
								)}

								<CommandEmpty>
									{!isLoading && predictions.length === 0 && (
										<div className="py-4 flex items-center justify-center">
											{searchInput === "" ? "Please enter an address" : "No address found"}
										</div>
									)}
								</CommandEmpty>
							</CommandGroup>
						</div>
					</CommandList>
				</div>
			)}
		</Command>
	);
}