import React, { Component } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Badge,
  FormGroup,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Button,
  ButtonGroup,
  Label,
  Input,
  Table, PaginationItem, PaginationLink, Pagination
} from 'reactstrap';

import _ from 'underscore'

import ReactHighcharts from 'react-highcharts';
import moment from 'moment-jalaali'
import JSONPretty from 'react-json-pretty';
import {
  getProject,
  getThingsMainDataAction, DownloadThingsDataExcelAction
} from '../../actions/AppActions';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { DateTimeRangePicker, DateTimePicker } from 'react-advance-jalaali-datepicker';
import Select2 from 'react-select2-wrapper';
import Spinner from '../Spinner/Spinner';
import { css } from 'glamor';
import ReactTable from 'react-table'
import Loading from '../../components/Loading';
import './project.css';

class ProjectsView extends Component {
  constructor(props) {
    super(props);
    this.setThing = this.setThing.bind(this)
    this.renderPeriodPicker = this.renderPeriodPicker.bind(this)
    this.renderTimePicker = this.renderTimePicker.bind(this)
    this.getData = this.getData.bind(this)
    this.draw = this.draw.bind(this)
    this.downloadExcel = this.downloadExcel.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)

    this.state = {
      draw: false,
      pages: 1,
      pageSize: 10,
      loading: false,
      type: 'area',
      selectedThing: {ids: []},
      period: 5000,
      project: {
        things: [],
        _id:  this.props.match.params['id']
      },
      auto: false,
      config: {},
      data: [],
      tableData: [],
      keys: [],
      visible: [],
      excelParams: {
        things: '',
        projectId: '',
        offset: '',
        limit: '',
        since: ''
      }
    }
  }


  componentWillMount() {
    this.loadProject()
  }

  componentWillReceiveProps(props) {
    if (this.state.project._id) {
      props.projects.forEach((project) => {
        if (project._id === this.state.project._id) {
          this.setState({
            project
          })
        }
      })
    }
  }

  loadProject() {
    if (this.state.project._id) {
      this.props.dispatch(getProject(this.state.project._id, undefined, 1))
    }
  }

  draw() {
    this.setState({draw: true})
    const config = {
      chart: {
        type: this.state.type,
        zoomType: 'x',
        style: {
          fontFamily: 'Tahoma'
        }
      },
      plotOptions: {
        series: {
          connectNulls: true
        }
      },
      time: {
        useUTC: false,
      },
      title: {
        text: 'داده‌های دریافتی'
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: 'مقدار'
        }
      },
      series: [{
        data: []
      }],
      credits: {
        enabled: true
      },
      tooltip: {
        backgroundColor: 'lightgray',
        borderColor: '#7CB5EC',
        borderRadius: 10,
        borderWidth: 3,
        useHTML: true,
        formatter: function () {
          const res =
            '<div>' +
            '<div style="text-align: center;direction: rtl">' + this.point.name + '</div>' +
            '<div style="text-align: center">' + this.series.name +
            ': <span style="font-weight: bold; ">' + this.y + '</span></div>' +
            '</div>';
          return res;
        }
      },
    }

    let things = {}
    this.state.project.things.forEach((thing) => {
      things[thing.interface.devEUI] = thing.name
    })

    // creates sensors series by their identification
    let sensors = []
    this.state.data.map((d, i) => {
      _.allKeys(d.data).map((k, i2) => {
        if (_.find(sensors, {name: `${things[d.thingid]}: ${k}`}) === undefined) {
          sensors.push({
            label: k,
            name: `${things[d.thingid]}: ${k}`,
            data: [],
            colorIndex: this.getcolor(k)
          })
        }
      })
    })

    // maps the sensors data into their series
    this.state.data.map((d) => {
      sensors.map((dataset, index) => {
        const n = Number(d.data[dataset.label])
        if (n !== NaN) {
          dataset.data.push({
            name: moment(d.timestamp, 'YYYY-MM-DD HH:mm:ss').format('jYYYY/jM/jD HH:mm:ss'),
            x: new Date(d.timestamp).getTime(),
            y: n
          })
        }
      })
    })
    config.series = sensors
    this.setState({
      config,
      draw: false
    })
  }

  getcolor(k) {
    return ((((k.split('').reduce(function (a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a
    }, 0)) % 10) + 10) % 10)
  }

  getThings() {
    let things = []
    this.state.project.things && this.state.project.things.forEach((thing) => {
        things.push({text: thing.name, id: thing._id})
      }
    )
    return things
  }

  setThing(things) {
    let selectedThing = {ids: []}
    for (let i = 0; i < things.target.selectedOptions.length; i++)
      selectedThing.ids.push(things.target.selectedOptions[i].value)
    this.setState({selectedThing})
  }

  componentWillUnmount() {
    // use intervalId from the state to clear the interval
    this.stop()
  }

  render() {
    return (
      <div>
        <Spinner display={(this.props.loading && !this.state.interval) || this.state.draw}/>
        <Card className="text-justify">
          <CardHeader style={{display: 'flex', alignItems: 'center'}}>
            <CardTitle className="mb-0 font-weight-bold h6">دریافت داده</CardTitle>
          </CardHeader>
          <CardBody>
            <Form>
              <FormGroup row>
                <Label sm={2}>شی ارسال کننده:‌</Label>
                <Col sm={5}>
                  <Select2
                    style={{width: '100%'}}
                    multiple
                    data={this.getThings()}
                    ref="tags"
                    value={this.state.selectedThing.ids}
                    onSelect={
                      this.setThing
                    }
                    onUnselect={this.setThing}
                    options={
                      {
                        placeholder: 'شی مورد نظر را انتخاب کنید',
                      }
                    }
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={2}>زمان داده:‌</Label>
                <Col sm={5}>
                  <Input type="select" onChange={
                    (event) => {
                      this.stop()
                      this.setState({
                        auto: !(event.target.value === '0'),
                        window: event.target.value
                      })
                    }
                  } name="type" id="select">
                    <option value={0}> بازه زمانی</option>
                    <option value={60}>یک ساعت اخیر</option>
                    <option value={5 * 60}>پنج ساعت اخیر</option>
                    <option value={10 * 60}>ده ساعت اخیر</option>
                    <option value={24 * 60}>یک روز اخیر</option>
                    <option value={168 * 60}>یک هفته اخیر</option>
                  </Input>
                </Col>
              </FormGroup>
              <FormGroup style={{display: this.state.auto ? 'none' : 'flex'}} row>
                <Label sm={2}></Label>
                <Col sm={5}>
                  {this.renderTimePicker()}
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={2}> نوع نمودار :</Label>
                <Col sm={5}>
                  <Input type="select" name="type"
                         onChange={(event) => {
                            this.setState({
                              type: event.target.value,
                            })
                         }} id="select">
                    <option value="area">خطی</option>
                    <option value="column">میله ای</option>
                  </Input>
                </Col>
              </FormGroup>
              <Button outline color="success" size="sm" onClick={() => {
                if (this.state.selectedThing.ids.length <= 0) {
                  toast('ابتدا شی مورد نظر را انتخاب نمایید', { autoClose: 15000, type: toast.TYPE.ERROR })
                  return
                }
                this.stop()

                if (this.state.since || this.state.window) {
                  this.setState({
                    excelParams: {
                      things: JSON.stringify(this.state.selectedThing),
                      projectId: this.state.project._id,
                      offset: 0,
                      limit: this.state.pageSize,
                      since: this.state.since ? this.state.since : Math.floor(Date.now() / 1000) - this.state.window * 60
                    }
                  });
                  this.props.dispatch(getThingsMainDataAction(JSON.stringify(this.state.selectedThing),
                    this.state.project._id,
                    0,
                    this.state.pageSize,
                    this.state.since ? this.state.since : Math.floor(Date.now() / 1000) - this.state.window * 60,
                    (status, data) => {
                      let pages = 1
                      if (this.state.pageSize === data.length)
                        pages++;
                      this.setState({tableData: data.reverse(), pages})
                    }));
                }
                this.getData(() => {
                  if (this.state.auto)
                    this.start();
                })
              }
              }>دریافت اطلاعات</Button>
            </Form>
          </CardBody>
        </Card>
        <Card className="text-justify">
          <CardHeader style={{display: 'flex'}}>
            <span>دریافت خودکار:</span>
            <Button onClick={() => this.stop()} color="danger" style={{marginRight: '5px'}}>توقف</Button>
            <Button onClick={() => this.start()} color="primary" style={{marginRight: '5px'}}>شروع</Button>
            <Loading size={'30px'} isOpen={this.state.interval}/>
          </CardHeader>
          <CardBody>
            <ReactHighcharts config={this.state.config}/>
          </CardBody>
        </Card>
        <Card className="text-justify">
          <CardHeader>
            <CardTitle className="mb-0 font-weight-bold h6">داده های جمع آوری شده</CardTitle>
          </CardHeader>
          <CardBody>
            <ReactTable
              data={[...this.state.tableData]}
              pages={this.state.pages}
              columns={this.reactTableColumns()}
              pageSizeOptions={[10, 15, 25, 50]}
              loading={this.state.loading}
              nextText='بعدی'
              previousText='قبلی'
              filterable={true}
              rowsText='ردیف'
              pageText='صفحه'
              ofText='از'
              minRows='1'
              noDataText='داده‌ای وجود ندارد'
              resizable={false}
              defaultPageSize={10}
              className="-striped -highlight"
              manual
              onFetchData={(state, instance) => {
                this.setState({
                  excelParams: {
                    things: JSON.stringify(this.state.selectedThing),
                    projectId: this.state.project._id,
                    offset: (state.page) * state.pageSize,
                    limit: state.pageSize,
                    since: this.state.since ? this.state.since : 0
                  }
                });
                this.setState({loading: false, tableData: [], pageSize: state.pageSize})
                if (this.state.since || this.state.window)
                  this.props.dispatch(getThingsMainDataAction(JSON.stringify(this.state.selectedThing),
                    this.state.project._id,
                    (state.page) * state.pageSize,
                    state.pageSize,
                    this.state.since ? this.state.since : 0,
                    (status, data) => {
                      let pages = state.page + 1
                      console.log(state.pageSize, data.length)
                      if (state.pageSize === data.length)
                        pages++;
                      this.setState({tableData: data.reverse(), loading: false, pages})
                    }));
              }}
            />
          </CardBody>
          <CardFooter>
            <Button onClick={this.downloadExcel} className="ml-1" color="success">خروجی اکسل</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  downloadExcel() {
    const params = this.state.excelParams;
    if (params.things && params.projectId)
      this.props.dispatch(DownloadThingsDataExcelAction(params.things, params.projectId, params.offset, params.limit, params.since))
    else
      toastAlerts(false, 'داده‌ای موجود نیست');
  }

  renderTimePicker() {
    return (!this.state.auto ? <DateTimeRangePicker placeholderStart="تاریخ و ساعت شروع"
                                                    placeholderEnd="تاریخ و ساعت پایان"
                                                    format="تاریخ: jYYYY/jMM/jDD ساعت: HH:mm"
                                                    onChangeStart={(e, b) => {
                                                      this.setState({
                                                        since: e
                                                      })
                                                    }}
                                                    onChangeEnd={(e, b) => {
                                                      this.setState({
                                                        until: e
                                                      })
                                                    }}
    /> : <DateTimePicker placeholder="انتخاب تاریخ و ساعت" format="تاریخ: jYYYY/jMM/jDD ساعت: HH:mm"
                         id="dateTimePicker"
                         onChange={(e, b) => {
                           this.setState({
                             since: e
                           })
                         }}
    />)
  }

  renderPeriodPicker() {
    if (this.state.auto)
      return (
        <Col>
          <Row>
            <Label syle={{marginRight: 20}}>پس از </Label>
            <Col sm={2}>
              <Input type="number" defaultValue={5} onChange={(e) => {
                let value = e.target.value
                this.setState({period: !isNaN(value) ? value * 1000 : 5000})
              }}/>
            </Col>
            <Label syle={{marginRight: 20}}>ثانیه </Label>
          </Row>
        </Col>
      )
  }

  reactTableColumns() {
    return [
      {
        id: 'time',
        Header: 'زمان دریافت داده',
        filterable: false,
        accessor: row => moment(row.timestamp, 'YYYY-MM-DD HH:mm:ss').format('jYYYY/jM/jD HH:mm:ss')
      },
      {
        Header: 'شی فرستنده',
        filterable: false,
        accessor: 'thingid'
      },
      {
        id: 'projectStatus',
        Header: 'داده دریافت شده',
        filterable: false,
        accessor: row => <div style={{textAlign: 'left', direction: 'ltr'}}><JSONPretty id="json-pretty"
                                                                                        json={row.data}/>
        </div>
      }, {
        id: 'raw',
        Header: 'داده خام',
        filterable: false,
        accessor: row => <div style={{whiteSpace: 'pre-wrap', textAlign: 'left', direction: 'ltr'}}>
          {row.raw}
        </div>
      },
    ];
  }

  start() {
    if (this.state.selectedThing.ids.length)
      this.setState({
        interval: setInterval(() => {
          this.getData()
        }, this.state.period)
      })
  }

  stop() {
    clearInterval(this.state.interval);
    this.setState({
      interval: 0
    })
  }


  getData(cb) {
    this.props.dispatch(getThingsMainDataAction(JSON.stringify(this.state.selectedThing),
      this.state.project._id,
      0,
      0,
      this.state.since ? this.state.since : Math.floor(Date.now() / 1000) - this.state.window * 60,
      (status, data) => {
        this.setState({data: data.reverse()})
        this.draw()
        if (cb)
          cb()
      }));
  }
}

function mapStateToPropes(state) {
  return {
    projects: state.projectReducer,
    loading: state.homeReducer.currentlySending
  }
}

export default connect(mapStateToPropes)(ProjectsView);
