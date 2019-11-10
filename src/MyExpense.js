import React, { Component } from 'react'
import {Form, Row, Col, ListGroup} from 'react-bootstrap'
import {RadialChart, LabelSeries} from 'react-vis'
import Arweave from 'arweave/web';
import AddExpense from './AddExpense'
import './MyExpense.css'

const LABEL_STYLE = {
  fontSize: '18px',
  textAnchor: 'middle'
}

class MyExpense extends Component {
  constructor(props){
    super(props)
    this.addExpense = this.addExpense.bind(this)
    this.onCloseExpense = this.onCloseExpense.bind(this)
    this.aesKey = ''
    this.state = {
      transactionName: '',
      amount: '',
      date:'',
      category:'Other',
      expenses: [],
      pieData:[],
      value: false,
      month: '',
      total: 0,
      showModal: false,
      income:0, 
      arBalance: 0
    }
    this.userKey = this.props.userKey
    this.allMonths = []
    this.arweave = Arweave.init();
  }

  async componentDidMount(){
    const address = await this.arweave.wallets.jwkToAddress(this.userKey)
    this.publicAddress = address
    // this.createTransaction()
    // this.getTransactionIds()
    this.getBalance()
    this.getExpenses()
  }

  // componentDidMount(){
  //   this.arweave.wallets.jwkToAddress(this.userKey).then((address)=>{
  //     this.publicAddress = address
  //     this.getBalance()
  //     // this.createTransaction()
  //     // this.getTransactionIds()
  //   })
  // }

  getBalance(){
    this.arweave.wallets.getBalance(this.publicAddress).then((balance) => {
      let arBalance = this.arweave.ar.winstonToAr(balance);
        this.setState({
          arBalance
        })
    });
  }

  async createTransaction(data, type){
    let transaction = await this.arweave.createTransaction({
        data
    }, this.userKey)
    transaction.addTag('type', type)
    await this.arweave.transactions.sign(transaction, this.userKey)
    const response = await this.arweave.transactions.post(transaction)
    return response
  }

  getTransaction(transactionId){
    return this.arweave.transactions.get(transactionId).then(transaction => {
      const transactionData = transaction.get('data', {decode: true, string: true})
      const parsedData = JSON.parse(transactionData)
      return parsedData
    })
  }
   
  async getTransactionIds(type){
    const txids = await this.arweave.arql({
      op: "and",
      expr1: {
        op: "equals",
        expr1: "from",
        expr2: this.publicAddress
      },
      expr2: {
        op: "equals",
        expr1: "type",
        expr2: type
      }
    })
    return txids
  }

  async getExpenses(){
    const type = 'expense';
    const txids = await this.getTransactionIds(type)
    const expenses = await Promise.all(await txids.map(async(txid)=>{
      const transactionData = await this.getTransaction(txid)
      return transactionData
    }))
    this.allMonths = this.getMonths(expenses)
    this.onMonthChange(this.allMonths[0], expenses)
  }
  
  addExpense(expense , fromQuery){
    const transactionName = expense.transactionName
    const amount = expense.amount
    const category = expense.category
    if(transactionName !== '' && amount !== ''){
      const expenses = this.state.expenses
      const expenseObj = {transactionName, amount, category, date: new Date()}
      expenses.push(expenseObj)
      this.createTransaction(JSON.stringify(expenseObj),'expense').then((res)=>{
        if(res.status===200){
          this.allMonths = this.getMonths(expenses)
          this.onMonthChange(this.allMonths[0], expenses)
          this.setState({
            expenses,
            showModal: false,
            transactionName: '',
            amount: '',
            category:'Other',
          })
        }
      })
    }
  }

  onAddExpense(){
    this.setState({
      showModal: true,
      transactionName: '',
      amount: '',
      category: 'Other',
    })
  }

  onCloseExpense(){
    this.setState({ 
      showModal: false
    })
  }

  toShortFormat(date){
    const dateObj = new Date(date)
    const month_names =["Jan","Feb","Mar",
                      "Apr","May","Jun",
                      "Jul","Aug","Sep",
                      "Oct","Nov","Dec"]
    return dateObj.getDate() + " " + month_names[dateObj.getMonth()] + " " + dateObj.getFullYear()
  }

  expenseList(){
    const expenses = this.state.expenses
    let currentDate = new Date(1970)
    const expenseList =[]
    this.monthList()
    expenses.forEach((expense, index) =>
    {
      const expenseDateObj = new Date(expense.date)
      const expenseDate = expenseDateObj.setHours(0,0,0,0)
      if(expenseDate !== currentDate){
        currentDate = expenseDate
        const shortdate = this.toShortFormat(currentDate)
        expenseList.push(<ListGroup.Item style={{padding: '10px'}} variant="dark" key={shortdate}>{shortdate}</ListGroup.Item>)
      }
      expenseList.push(
      <ListGroup.Item className="list-item" key={index}>
        {expense.transactionName}: {expense.amount}
      </ListGroup.Item>)
    })
    return expenseList
  }

  monthList(){
    const monthList = []
    this.allMonths.forEach((month)=>{
      monthList.push(<option key={month}>{month}</option>)
    })
    return monthList
  }

  getMonths(expenses){
    const allMonths = new Set()
    expenses.forEach((expense)=>{
      if(expense.date===undefined){
        expense.date = new Date()
      }
      const shortdate = this.toShortFormat(new Date(expense.date)).split(" ")
      allMonths.add(shortdate[1]+' '+shortdate[2])
    })
    return [...allMonths]
  }

  onMonthChange(month, expenses){
    if(expenses===undefined){
      expenses = this.state.expenses
    }
    const categoryDistribution = {}
    let monthlySpend = 0
    expenses.forEach((expense)=>{
      if(expense.date===undefined){
        expense.date = new Date()
      }
      const shortdate = this.toShortFormat(new Date(expense.date)).split(" ")
      if((shortdate[1]+' '+shortdate[2])===month){
        const amount = parseInt(expense.amount)
        monthlySpend += amount
        if(categoryDistribution[expense.category]!== undefined){
          categoryDistribution[expense.category]+= amount
        } else{
          categoryDistribution[expense.category] = amount
        }
      }
    })
    let income = 0
    if(categoryDistribution['Income']!==undefined){
      monthlySpend -= categoryDistribution['Income']
      income = categoryDistribution['Income']
    }
    const pieData = []
    for ( var key in categoryDistribution){
      if(key !== 'Income'){
        pieData.push({category:key, spend:categoryDistribution[key]})
      }
    }
    const total = monthlySpend
    this.setState({
      expenses,
      month,
      pieData,
      total,
      income
    })
  }

  render() {
    const {value} = this.state
    return (
    <div className="p-3">
    <div class="row">
      <div class="col">
        <button className="btn btn-primary" onClick={this.onAddExpense.bind(this)}>
          Add Expense
        </button>
      </div>
      <div class="text-right pr-3">
        <span class="p-2 bg-dark text-light rounded">
          AR Balance: {this.state.arBalance}
        </span>
      </div>
    </div>
    <small className="text-muted pl-2">New transactions may take a while to show up. Please wait while we write it to the blockchain.</small><br></br>
      {this.state.showModal? 
      <AddExpense 
        transactionName={this.state.transactionName} 
        amount={this.state.amount}
        category={this.state.category}
        onSaveExpense={this.addExpense}
        onCloseExpense={this.onCloseExpense}
      >
      </AddExpense>: '' }
      {this.state.expenses.length===0? <h4 className="p-2 font-weight-light text-center">No expenses yet!</h4>: 
        <Row>
          <Col className="pt-3 col-xs col-md-6">
            <h5>Transactions</h5>
            <ListGroup className="border" style={{maxHeight: '450px', overflowY:'scroll'}}>
              {this.expenseList()}
            </ListGroup>
          </Col>
          <Col className="pt-3 col-xs col-md-4">
            <h5>Insights(Monthly)</h5>
            <div style={{paddingTop: '5px'}}>
              <Row>
                <Col className="col-md-4">
                  <Form.Group>
                    <Form.Control as="select" value={this.state.month} onChange={(e)=>this.onMonthChange(e.target.value)}>
                      {this.monthList()}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col className="col-md-3">
                  <span>
                    Total: {this.state.total}
                  </span>
                </Col>
                <Col className="col-md-3">
                  <span>
                    Income: {this.state.income}
                  </span>
                </Col>
              </Row>
              <RadialChart
                colorType="linear"
                colorDomain={[0, 12]}
                colorRange={["grey","black"]}
                innerRadius={100}
                radius={170}
                getAngle={d => d.spend}
                data={this.state.pieData}
                onValueMouseOver={v => this.setState({value: v})}
                onSeriesMouseOut={v => this.setState({value: false})}
                width={350}
                height={400}
                padAngle={0.04}
              >
                {value && 
                <LabelSeries
                data={[{x: 0, y: 0, label: value.category+': '+ value.spend, style: LABEL_STYLE}]}
              />}
              </RadialChart>
            </div>
          </Col>
        </Row>
      }
    </div>
    )
  }
}

export default MyExpense
