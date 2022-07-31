class Calculator {
	// main constructor with parameters:
	// previousValueText - value before click operation button
	// currentValueText - current value
	constructor(previousValueText, currentValueText)
	{
		this.clearAll()
		this.previousValueText = previousValueText
		this.currentValueText = currentValueText
	}
	
	// clears all fields
	clearAll()
	{
		this.previousValue = ""
		this.currentValue = ""
		this.operation = null
		this.error = false
		this.percent = false
	}
	
	// concatenate numbers into one number
	concatenateNumbers(number)
	{
		if(this.error)
		{
			this.clearAll()
			return
		}
		
		// max length of display - 34 chars
		if(this.currentValue.toString().length > 34)
			return
		
		// if selected comma before, don't put it twice
		if(!(number === "." && this.currentValue.includes(".")))
			this.currentValue += number.toString()
	}
	
	// set operation
	setOperation(operation)
	{
		if(this.error)
		{
			this.clearAll()
			return
		}
		
		// if no number is given
		if(this.currentValue === "")
			return
		
		// if selected operation before, evaluate it
		if(this.previousValue !== "")
			this.evaluate()
		
		this.operation = operation
		this.previousValue = this.currentValue
		this.currentValue = ""
	}
	
	// validator for basic operations
	validateValues()
	{	
		// invalid number
		if((isNaN(this.tempPrev) && !this.percent) || isNaN(this.tempCurr))
			throw "Invalid data!"
		
		// division by zero
		if(this.tempCurr === 0 && this.operation === "/")
			throw "Division by zero!"
	}
	
	
	// validator for special operations
	validateValuesSpecial()
	{
		if(isNaN(this.tempCurr))
			throw "Invalid data!"

		if(!isFinite(this.tempCurr))
			throw "Can't get value from infinite"

		// logarithm check
		if(this.tempCurr < 1 && (this.operation === "log10" || this.operation === "ln"))
			throw "The logarithm of a number <= 0"
		
		// factorial check
		if(this.tempCurr < 1 && this.operation === "factorial")
			throw "The factorial of a number < 1"
		
		// square sqrt check
		if(this.tempCurr < 0 && this.operation === "sqrt")
			throw "Square root of a negative number!"
		
		// trigonometry check
		if(this.operation === "tan" && !isFinite(Math.tan(this.tempCurr)))
			throw "Not defined"
		
		if(this.operation === "ctg" && !isFinite(1 / Math.tan(this.tempCurr)))
			throw "Not defined"
	}

	// evaluate method from two numbers and operation (basic operations)
	evaluate()
	{
		this.result = 0
		try {
			this.tempPrev = parseFloat(this.previousValue)
			this.tempCurr = parseFloat(this.currentValue)

			this.validateValues()

			if(this.percent) {
				if(isNaN(this.tempPrev)) this.tempPrev = 1
				this.tempCurr = this.percentOperation(this.tempPrev, this.tempCurr)
			}
			
			switch(this.operation)
			{
				case "+": this.result = this.tempPrev + this.tempCurr; break;
				case "-": this.result = this.tempPrev - this.tempCurr; break;
				case "*": this.result = this.tempPrev * this.tempCurr; break;
				case "/": this.result = this.tempPrev / this.tempCurr; break;
				default: this.result = this.tempCurr
			}

			this.addToHistoryBasic()

			this.previousValue = ""
			this.currentValue = this.result
			this.operation = null
		}
		catch (e)
		{
			this.error = true
			this.currentValue = e
			this.previousValue = ""
			this.operation = null
		}

		this.updateDisplay()
	}
	
	// evaluate method for special operations
	evaluateSpecial()
	{
		this.result = 0
		
		try {
			this.tempCurr = parseFloat(this.previousValue)
			this.validateValuesSpecial()
			
			switch(this.operation)
			{
				case "sqrt": this.result = Math.sqrt(this.tempCurr); break;
				case "sin": this.result = Math.sin(this.tempCurr); break;
				case "cos": this.result = Math.cos(this.tempCurr); break;
				case "tan": this.result = Math.tan(this.tempCurr); break;
				case "ctg": this.result = 1 / Math.tan(this.tempCurr); break;
				case "factorial": {
					const fact = n => n > 1 ? n * fact(n - 1) : n;
					this.result = fact(this.tempCurr);
				} break;
				case "powerTwo": this.result = this.tempCurr * this.tempCurr; break;
				case "powerThree": this.result = Math.pow(this.tempCurr, 3); break;
				case "reverse": this.result = 1 / this.tempCurr; break;
				case "tenPower": this.result = Math.pow(10, this.tempCurr); break;
				case "log10": this.result = Math.log10(this.tempCurr); break;
				case "cubeSqrt": this.result = Math.cbrt(this.tempCurr); break;
				case "twoPower": this.result = Math.pow(2, this.tempCurr); break;
				case "ln": this.result = Math.log(this.tempCurr); break;
				case "ePower": this.result = Math.exp(this.tempCurr); break;
				default: return;
			}

			this.addToHistorySpecial()

			this.previousValue = ""
			this.currentValue = this.result
			this.operation = null
		}
		catch (e)
		{
			this.error = true
			this.currentValue = e
			this.previousValue = ""
			this.operation = null
			this.updateDisplay()
		}
	}
	
	
	// update display
	updateDisplay()
	{		
		this.currentValueText.innerHTML = this.currentValue
		if(this.operation != null)
		{
			this.previousValueText.innerHTML = this.previousValue + " " + this.operation
		}
		else
		{
			this.previousValueText.innerHTML = ""
		}
	}
	
	// delete one number from input (left arrow)
	delete()
	{
		if(this.error)
		{
			this.clearAll()
		}
		else
		{
			this.currentValue = this.currentValue.toString().slice(0,-1)
		}
	}

	addToHistoryBasic()
	{
		let elementString

		if(this.percent && this.tempPrev === 1)
			elementString = "<li>" + this.tempCurr*100 + "% = " + this.result + "</li>"
		else
			elementString = "<li>" + this.tempPrev + " " + this.operation + " " + this.tempCurr + " = " + this.result + "</li>"

		historyElements.innerHTML = elementString + historyElements.innerHTML
	}

	addToHistorySpecial()
	{
		let prettyOperator = this.getPrettySpecialOperator(this.operation, this.tempCurr)
		let elementString = "<li>" + prettyOperator + " = " + this.result + "</li>"
		historyElements.innerHTML = elementString + historyElements.innerHTML
	}

	getPrettySpecialOperator(operator, value)
	{
		let prettyOperator

		switch(operator)
		{
			case "sqrt": prettyOperator = "&radic;" + value; break;
			case "sin": prettyOperator = "sin" + value; break;
			case "cos": prettyOperator = "cos" + value; break;
			case "tan": prettyOperator = "tan" + value; break;
			case "ctg": prettyOperator = "ctg" + value; break;
			case "factorial": prettyOperator = value + "!"; break;
			case "powerTwo": prettyOperator = value + "<sup>2</sup>"; break;
			case "powerThree": prettyOperator = value + "<sup>3</sup>"; break;
			case "reverse": prettyOperator = "1/" + value; break;
			case "tenPower": prettyOperator = "10<sup>" + value + "</sup>"; break;
			case "log10": prettyOperator = "log<sub>10</sub>" + value; break;
			case "cubeSqrt": prettyOperator = "&#x221B;" + value; break;
			case "twoPower": prettyOperator = "2<sup>" + value + "</sup>"; break;
			case "ln": prettyOperator = "ln" + value; break;
			case "ePower": prettyOperator = "e<sup>" + value + "</sup>"; break;
			default: prettyOperator = ""
		}

		return prettyOperator
	}

	clearHistory()
	{
		historyElements.innerHTML = ""
	}
	
	percentOperation(previous, current)
	{
		return previous * (current / 100)
	}

	// inverse number (+/-)
	inverse()
	{
		if(!this.error)
			this.currentValue *= -1
	}
	
	// get exponential value
	exponential()
	{
		this.currentValue = ""
		this.concatenateNumbers(Math.E)
	}
	
	// get PI value
	pi()
	{
		this.currentValue = ""
		this.concatenateNumbers(Math.PI)
	}
}

// fetch all buttons values
numberButtons = document.querySelectorAll('.numbers') // numeric 1,2,3,...,9
operationButtons = document.querySelectorAll(".operators") // basic operations */+-
equalsButton = document.querySelectorAll(".equals") // equals
percentButton = document.querySelectorAll(".percent") // percent
deleteButtons = document.querySelector(".delete") // delete one number from input ←
clearButton = document.querySelector(".clear") // clear button
inverseButton = document.querySelector(".inverse") // inverse number
specialButtons = document.querySelectorAll(".special") // special operations ex. x!, log, cos, tan, ...
clearHistoryButton = document.querySelector(".history_button") // using for clear calculations history
historyElements = document.querySelector(".historyElements");

// get numbers from display 
previousValueText = document.getElementsByClassName("previousValue")[0]
currentValueText = document.getElementsByClassName("currentValue")[0]


// initialize new object...
calculator = new Calculator(previousValueText, currentValueText)


// ******************
// **  LISTENERS:
// ******************
// number buttons
numberButtons.forEach(button => {
	button.addEventListener("click", () => {
		calculator.concatenateNumbers(button.value)
		calculator.updateDisplay()
	})
})

// basic operations buttons
operationButtons.forEach(button => {
	button.addEventListener("click", () => {
		calculator.setOperation(button.value)
		calculator.updateDisplay()
	})
})

// special operations buttons
specialButtons.forEach(button => {
	button.addEventListener("click", () => {
		if(button.value === "e")
		{
			calculator.exponential()
		}
		else if(button.value === "pi")
		{
			calculator.pi()
		}
		else
		{
			calculator.setOperation(button.value)
			calculator.evaluateSpecial()
		}
		
		calculator.updateDisplay()
	})
})

// equals button
equalsButton.forEach(button => {
	button.addEventListener("click", () => {
		calculator.evaluate()
	})
})

// percent button
percentButton.forEach(button => {
	button.addEventListener("click", () => {
		calculator.percent = true
		calculator.evaluate()
		calculator.percent = false
	})
})

// delete button
deleteButtons.addEventListener("click", function() {
	calculator.delete()
	calculator.updateDisplay()
})

// keyboard input
document.body.addEventListener("keydown", event => {
	document.getElementsByClassName("nothing")[0].focus()
	
	// backspace removes one number
	if (event.key === "Backspace")
		calculator.delete()
	
	// enter means equals
	if(event.key === "Enter")
		calculator.evaluate()
  
	// numbers
	if(event.key >= "0" && event.key <= "9")
		calculator.concatenateNumbers(event.key)
  
	// comma (dot or comma)
	if(event.key === "." || event.key === ",")
		calculator.concatenateNumbers(".")
  
	// multiplication
	if(event.key === "*")
		calculator.setOperation("*")
  
	// division
	if(event.key === "/")
		calculator.setOperation("/")
  
	// sum
	if(event.key === "+")
		calculator.setOperation("+")
  
	// subtract
	if(event.key === "-")
		calculator.setOperation("-")


	calculator.updateDisplay()
})

// clear button (CE)
clearButton.addEventListener("click", function() {
	calculator.clearAll()
	calculator.updateDisplay()
})

// inverse button
inverseButton.addEventListener("click", function() {
	calculator.inverse()
	calculator.updateDisplay()
})

// clear history button
clearHistoryButton.addEventListener("click", function() {
	calculator.clearHistory()
})