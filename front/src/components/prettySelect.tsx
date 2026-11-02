export default function PrettySelect({
	hint,
	options,
	setter,
}: {
	hint: string;
	options: string[];
	setter: React.Dispatch<React.SetStateAction<string>>;
}) {
	return (
		<select
			onChange={(a) => {
				setter(a.currentTarget.value);
			}}
		>
			<option>{hint}</option>
			{options.map((v) => {
				return <option key={v}>{v}</option>;
			})}
		</select>
	);
}
