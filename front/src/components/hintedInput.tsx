import "./hintedInput.css";
export default function HintedInput({
	hint,
	setter,
}: {
	hint: string;
	setter: React.Dispatch<React.SetStateAction<string>>;
}) {
	return (
		<span className="hintedInput">
			<span className="label">{hint}</span>
			<input
				required={true}
				onChange={(v) => {
					setter(v.target.value);
				}}
			/>
		</span>
	);
}
