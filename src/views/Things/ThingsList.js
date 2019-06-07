import React, {Component} from 'react'
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    UncontrolledTooltip
} from 'reactstrap'
import moment from 'moment-jalaali'
import ReactTable from 'react-table'
import {connect} from 'react-redux'
import Spinner from '../Spinner/Spinner'
import {
    deleteMultipleThingAction,
    DownloadUserThingsExcelAction,
    getThings,
    getUsersThingsListAction
} from '../../actions/AppActions'
import {toastAlerts} from '../Shared/toast_alert'
import {Link} from 'react-router-dom'

import {Map, Marker, Popup, TileLayer} from 'react-leaflet'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

class ThingsList extends Component {

    constructor(props) {
        super(props);
        this.deleteThings = this.deleteThings.bind(this);
        this.toggle = this.toggle.bind(this);
        this.callback = this.callback.bind(this);
        this.setThings = this.setThings.bind(this);
        this.fetchThings = this.fetchThings.bind(this);
        this.state = {
            deleteThingsModal: false,
            deleteThingIds: [],
            things: [],
            table: {
                pages: 1,
            },
        }
    }

    componentDidMount() {
    }

    toggle(modal) {
        let state = {};
        if (modal === 'deleteThings') {
            state = {
                deleteThingsModal: !this.state.deleteThingsModal,
            }
        }
        this.setState(state)
    }

    fetchThings(state, instance) {
        this.setState({table: {...this.state.table, loading: true}});
        this.props.dispatch(getUsersThingsListAction(
            state.pageSize,
            state.page * state.pageSize,
            {sorted: JSON.stringify(state.sorted), filtered: JSON.stringify(state.filtered)},
            this.setThings
        ))
    }

    setThings(res) {
        this.setState({
            things: res.things,
            table: {
                pages: res.pages,
                loading: false,
            }
        })
    }

    deleteThings() {
        const data = {
            things_id: this.state.deleteThingIds,
        };
        this.toggle('deleteThings');
        this.props.dispatch(deleteMultipleThingAction(data.things_id, this.callback))
    }

    callback(status, message) {
        toastAlerts(status, message);
        this.props.dispatch(getThings())
    }

    render() {
        return (
            <div>
                <Modal isOpen={this.state.deleteThingsModal} toggle={() => this.toggle('deleteThings')}
                       className="text-right">
                    <ModalHeader>حذف شی</ModalHeader>
                    <ModalBody>
                        <h3>آیا از حذف اشیای انتخاب شده مطمئن هستید ؟</h3>
                        <br/>
                        <h5>پس از حذف امکان برگشت اطلاعات وجود ندارد.</h5>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" className="ml-1" onClick={() => {
                            this.deleteThings()
                        }}>حذف</Button>
                        <Button color="danger" onClick={() => this.toggle('deleteThings')}>انصراف</Button>
                    </ModalFooter>
                </Modal>

                <Spinner display={this.props.loading}/>
                <Card className="text-justify">
                    <CardHeader>
                        <CardTitle className="mb-0 font-weight-bold h6">لیست اشیاء</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <ReactTable
                            data={this.state.things}
                            columns={this.reactTableColumns()}
                            nextText='بعدی'
                            previousText='قبلی'
                            filterable={true}
                            rowsText='ردیف'
                            pageText='صفحه'
                            ofText='از'
                            minRows='3'
                            noDataText='شی‌ای وجود ندارد'
                            loadingText='در حال دریافت اطلاعات...'
                            resizable={false}
                            loading={this.state.table.loading}
                            onFetchData={this.fetchThings}
                            pages={this.state.table.pages}
                            pageSizeOptions={[5, 10, 15, 25]}
                            manual
                            defaultPageSize={5}
                            className="-striped -highlight"
                        />
                    </CardBody>
                    <CardFooter>
                        <Button onClick={() => this.toggle('deleteThings')} color="danger">حذف انتخاب شده‌ها</Button>
                        <Button
                            onClick={() => this.props.dispatch(DownloadUserThingsExcelAction())}
                            className="ml-1"
                            color="success">خروجی اکسل</Button>
                    </CardFooter>
                </Card>
                <Card className="text-justify">
                    <CardHeader>
                        <CardTitle className="mb-0 font-weight-bold h6">محل قرارگیری اشیا</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <Map center={[35.806027697498365, 51.3983747884308]} zoom={10}>
                            <TileLayer
                                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {
                                this.state.things.map((t) => {
                                    return (<Marker draggable={false}
                                                    position={[t.loc.coordinates[1], t.loc.coordinates[0]]}
                                                    key={t._id}
                                                    icon={L.icon({
                                                        iconSize: [25, 41],
                                                        iconAnchor: [13, 41],
                                                        iconUrl: iconUrl,
                                                        shadowUrl: shadowUrl
                                                    })}
                                    >
                                        <Popup>{t.name}</Popup>
                                    </Marker>)
                                })
                            }
                        </Map>
                    </CardBody>
                </Card>
            </div>
        )
    }

    toggleCheckbox(id) {
        let ids = [...this.state.deleteThingIds];
        let index = ids.indexOf(id);
        if (index !== -1) {
            ids.splice(index, 1)
        } else {
            ids.push(id)
        }
        this.setState({deleteThingIds: ids}, () => console.log(this.state))
    }

    reactTableColumns() {
        return [
            {
                Header: 'انتخاب',
                id: 'select',
                accessor: row => <input type="checkbox" onChange={() => this.toggleCheckbox(row._id)}/>,
                maxWidth: 50
            },
            {
                Header: 'نام',
                accessor: 'name',
                maxWidth: 200
            },
            {
                Header: 'آدرس',
                accessor: 'dev_eui',
                filterMethod: (filter, row) =>
                    row[filter.id].startsWith(filter.value) ||
                    row[filter.id].endsWith(filter.value),
                maxWidth: 180
            },
            {
                Header: 'نوع',
                accessor: 'type',
                maxWidth: 50
            },
            {
                Header: 'نحوه پارس کردن',
                accessor: 'model',
                maxWidth: 50
            },
            {
                Header: 'فعال سازی',
                accessor: 'activation',
                filterMethod: (filter, row) => row[filter.id].startsWith(filter.value.toUpperCase()),
                maxWidth: 50
            },
            {
                id: 'status',
                Header: 'وضعیت',
                filterable: false,
                accessor: row => {
                    return (<div>
                        {row.type === 'lora' ?
                            <Badge id={`tooltip-${row._id}`}
                                   color={row.last_seen_at['status']}>{row.last_seen_at['time'] ?
                                'اخرین تاریخ دریافت داده' : 'عدم دریافت داده'}</Badge> : ''}
                        {row.last_seen_at['time'] &&
                        <UncontrolledTooltip placement="top" target={`tooltip-${row._id}`}>
                            {moment(row.last_seen_at.time, 'YYYY-MM-DD HH:mm:ss').format('jYYYY/jM/jD HH:mm:ss')}
                        </UncontrolledTooltip>}
                        {' '}
                        <Badge color={row.active ? 'success' : 'secondary'}>
                            {'وضعیت:'} {row.active ? 'فعال' : 'غیرفعال'}
                        </Badge>
                        {' '}
                        <Badge id={`tooltip2-${row._id}`} color={!row.last_parsed_at ? 'secondary' : 'success'}>
                            {row.last_parsed_at && row.last_parsed_at !== '' ? 'اخرین زمان پارس داده' : 'عدم پارس داده'}
                        </Badge>
                        {row.last_parsed_at && row.last_parsed_at !== '' ?
                            <UncontrolledTooltip placement="top" target={`tooltip2-${row._id}`}>
                                {moment(row.last_parsed_at, 'YYYY-MM-DD HH:mm:ss').format('jYYYY/jM/jD HH:mm:ss')}
                            </UncontrolledTooltip> : ''}
                    </div>)
                }
            },
            {
                id: 'rowTools',
                Header: 'امکانات',
                maxWidth: 150,
                filterable: false,
                accessor: row => {
                    return (<div>
                        <Input type="select" name="type"
                               onChange={(e) => {
                                   let action = e.target.value;
                                   e.target.value = '';
                                   if (action === 'edit') {
                                       window.location = `#/things/edit/${row.project._id}/${row._id}`
                                   } else if (action === 'send_codec') {
                                       window.location = `#/codec/${row.project._id}/${row._id}`
                                   }

                               }} id="select">
                            <option value="">امکانات</option>
                            <option value="edit">ویرایش</option>
                            <option value="send_codec">ارسال codec</option>
                        </Input>
                    </div>)
                }
            },
            {
                id: 'project',
                Header: 'پروژه',
                maxWidth: 200,
                filterable: false,
                accessor: (row) => {
                    return (<Link to={`/projects/manage/show/${row.project._id}`}>
                        <Button className="ml-1" color="warning" size="sm">{row.project.name}</Button>
                    </Link>)
                }
            },
        ]
    }
}

function mapStateToProps(state) {
    return {
        things: state.thingReducer,
        loading: state.homeReducer.currentlySending
    }
}

export default connect(mapStateToProps)(ThingsList)
