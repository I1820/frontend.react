import React, {Component} from 'react';
import {
  Col,
  Card,
  Form,
  FormGroup,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  ListGroup,
  ListGroupItem,
  Button,
  ModalFooter,
  Label,
  Tooltip,
  Input,
  Table, Modal, ModalHeader, ModalBody, Badge
} from 'reactstrap';
import {connect} from 'react-redux';
import {
  activeThingAction,
  editProjectAction,
  getProject,
  deleteThingAction,
  getCodecTemplateListAction, activateScenarioAction, deleteCodecAction, deleteScenarioAction, editAliasesAction,
  sendDownlinkAction,
} from '../../actions/AppActions';
import Spinner from '../Spinner/Spinner';

import {ToastContainer, toast} from 'react-toastify';
import {css} from 'glamor';
import {style} from 'react-toastify';
import Logger from "../../components/Logger";

style({
  colorProgressDefault: 'white'
});

class ProjectsManage extends Component {
  constructor(props) {
    super(props);

    this.toggleABP = this.toggleABP.bind(this)
    this.toggleOTAA = this.toggleOTAA.bind(this)
    this.addThing = this.addThing.bind(this)
    this.addScenario = this.addScenario.bind(this)
    this.dataModalToggle = this.dataModalToggle.bind(this)
    this.renderDownlinkRow = this.renderDownlinkRow.bind(this)
    this.addTemplate = this.addTemplate.bind(this)
    this.uploadExcel = this.uploadExcel.bind(this)
    this.renderTemplateItem = this.renderTemplateItem.bind(this)
    this.deleteThingModalToggle = this.deleteThingModalToggle.bind(this)
    this.deleteThing = this.deleteThing.bind(this)
    this.deleteCodec = this.deleteCodec.bind(this)
    this.deleteScenario = this.deleteScenario.bind(this)
    this.manageToastAlerts = this.manageToastAlerts.bind(this)
    this.loadProject = this.loadProject.bind(this)
    this.downLinksAdd = this.downLinksAdd.bind(this)
    this.renderScenarios = this.renderScenarios.bind(this)
    this.renderCodecs = this.renderCodecs.bind(this)
    this.deleteCodecModalToggle = this.deleteCodecModalToggle.bind(this)
    this.deleteScenarioModalToggle = this.deleteScenarioModalToggle.bind(this)
    this.deleteAlias = this.deleteAlias.bind(this)
    this.renderAliasTd = this.renderAliasTd.bind(this)
    this.toggle = this.toggle.bind(this);

    this.state = {
      tooltipOpen: [],
      OTAAmodal: false,
      ABPmodel: false,
      id: '',
      project: {},
      dataModal: false,
      modalDownlinkRows: [],
      OTAA: {},
      ABP: {},
      deleteThingModal: false,
      deleteThingRowId: 0,
      deleteCodecModal: false,
      deleteCodecRowId: 0,
      deleteScenarioModal: false,
      deleteScenarioRowId: 0,
      DownlinkThingRowId: 0,
      newAlias: {key: '', alias: ''}
    };
    this.el_refs = {
      alias: {
        key: '',
        value: '',
      }
    };
    this.nextId = 1;
  }

  downLinksAdd() {
    this.dataModalToggle(0);
    const data = {};
    let json;
    this.state.modalDownlinkRows.forEach((item) => {
      if (item.key && item.value)
        data[item.key] = item.value;
    })
    json = JSON.stringify(data);
    this.props.dispatch(sendDownlinkAction(
      this.state.project._id,
      this.state.DownlinkThingRowId,
      {data: json},
      this.callback
    ))
  }

  deleteThing() {
    this.deleteThingModalToggle(0)
    this.props.dispatch(deleteThingAction(
      this.state.project._id,
      this.state.deleteThingRowId,
      this.manageToastAlerts
    ))
  }

  deleteCodec() {
    this.deleteCodecModalToggle(0)
    this.props.dispatch(deleteCodecAction(
      this.state.project._id,
      this.state.deleteCodecRowId,
      this.manageToastAlerts
    ))
  }

  deleteScenario() {
    this.deleteScenarioModalToggle(0)
    this.props.dispatch(deleteScenarioAction(
      this.state.project._id,
      this.state.deleteScenarioRowId,
      this.manageToastAlerts
    ))
  }

  manageToastAlerts(status, message) {
    if (status === true) {
      // this.deleteThingModalToggle()
      this.loadProject()

      toast('آیتم مورد نظر حذف شد', {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: css({
          background: '#dbf2e3',
          color: '#28623c'
        }),
        progressClassName: css({
          background: '#28623c'
        })
      });
    } else {
      toast(message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: css({
          background: '#fee2e1',
          color: '#813838',
        }),
        progressClassName: css({
          background: '#813838'
        })
      });
    }
  }

  componentWillMount() {
    this.loadProject()
  }

  componentWillReceiveProps(props) {
    const splitedUrl = window.location.href.split('/');
    const me = this;
    if (splitedUrl[splitedUrl.length - 1]) {
      props.projects.forEach((project) => {

        if (project._id === splitedUrl[splitedUrl.length - 1]) {
          this.setState({
            project
          })
        }
      })
    }
  }

  deleteThingModalToggle(id) {
    this.setState({
      deleteThingModal: !this.state.deleteThingModal,
      deleteThingRowId: id
    });
  }

  deleteCodecModalToggle(id) {
    this.setState({
      deleteCodecModal: !this.state.deleteCodecModal,
      deleteCodecRowId: id
    });
  }

  deleteScenarioModalToggle(id) {
    this.setState({
      deleteScenarioModal: !this.state.deleteScenarioModal,
      deleteScenarioRowId: id
    });
  }


  loadProject() {
    const splitedUrl = window.location.href.split('/');
    if (splitedUrl[splitedUrl.length - 1]) {
      this.props.dispatch(getProject(splitedUrl[splitedUrl.length - 1], (status) => {
        if (status)
          this.props.dispatch(getCodecTemplateListAction(splitedUrl[splitedUrl.length - 1]))
      }))
    }
  }

  render() {
    return (
      <div>
        <Spinner display={this.props.loading}/>
        <ToastContainer className="text-right"/>

        <Modal isOpen={this.state.deleteScenarioModal} toggle={this.deleteScenarioModalToggle}
               className="text-right">
          <ModalHeader>حذف شی</ModalHeader>
          <ModalBody>
            <h3>آیا از حذف سناریو مطمئن هستید ؟</h3>
            <br/>
            <h5>پس از حذف امکان برگشت اطلاعات وجود ندارد.</h5>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" className="ml-1" onClick={() => {
              this.deleteScenario()
            }}>حذف</Button>
            <Button color="danger" onClick={this.deleteScenarioModalToggle}>انصراف</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.deleteCodecModal} toggle={this.deleteCodecModalToggle} className="text-right">
          <ModalHeader>حذف شی</ModalHeader>
          <ModalBody>
            <h3>آیا از حذف قالب مطمئن هستید ؟</h3>
            <br/>
            <h5>پس از حذف امکان برگشت اطلاعات وجود ندارد.</h5>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" className="ml-1" onClick={() => {
              this.deleteCodec()
            }}>حذف</Button>
            <Button color="danger" onClick={this.deleteCodecModalToggle}>انصراف</Button>
          </ModalFooter>
        </Modal>


        <Modal isOpen={this.state.deleteThingModal} toggle={this.deleteThingModalToggle} className="text-right">
          <ModalHeader>حذف شی</ModalHeader>
          <ModalBody>
            <h3>آیا از حذف شی مطمئن هستید ؟</h3>
            <br/>
            <h5>پس از حذف امکان برگشت اطلاعات وجود ندارد.</h5>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" className="ml-1" onClick={() => {
              this.deleteThing()
            }}>حذف</Button>
            <Button color="danger" onClick={this.deleteThingModalToggle}>انصراف</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.dataModal} toggle={this.dataModalToggle} className="text-right">
          <ModalHeader>ارسال داده</ModalHeader>
          <ModalBody>
            {this.state.modalDownlinkRows.map(row => this.renderDownlinkRow(row.id, row.key, row.value))}
            <Button color="success" onClick={() => {
              this.setState({
                modalDownlinkRows: [...this.state.modalDownlinkRows, {
                  id: this.nextId++,
                  key: '',
                  value: ''
                }]
              })
            }}>+ اضافه</Button>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" className="ml-1" onClick={this.downLinksAdd}>ثبت</Button>
            <Button color="danger" onClick={this.dataModalToggle}>انصراف</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.OTAAmodal} toggle={this.toggleOTAA} className="text-right">
          <ModalHeader>OTAA</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup row>
                <Label sm={3}> appKey : </Label>
                <Col sm={9}>
                  <Input onChange={(event) => {
                    this.setState({
                      OTTA: {
                        appKey: event.target.value
                      }
                    })
                  }} type="text"/>
                </Col>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" className="ml-1" onClick={() => {
              this.toggleOTAA()
              this.props.dispatch(activeThingAction(this.state.OTTA, this.state.selectedThing,
                this.state.project._id, this.callback))
            }}>ارسال</Button>
            <Button color="danger" onClick={this.toggle}>انصراف</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.ABPmodel} toggle={this.toggleABP} className="text-right">
          <ModalHeader>ABP</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup row>
                <Label sm={3}>appSKey : </Label>
                <Col sm={9}>
                  <Input name="appSKey"
                         onChange={(event) => {
                           this.setState({
                             ABP: {
                               ...this.state.ABP,
                               [event.target.name]: event.target.value
                             }
                           })
                         }} type="text"/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3}>devAddr : </Label>
                <Col sm={9}>
                  <Input name="devAddr"
                         onChange={(event) => {
                           this.setState({
                             ABP: {
                               ...this.state.ABP,
                               [event.target.name]: event.target.value
                             }
                           })
                         }} type="text"/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3}>fCntDown : </Label>
                <Col sm={9}>
                  <Input name="fCntDown"
                         onChange={(event) => {
                           this.setState({
                             ABP: {
                               ...this.state.ABP,
                               [event.target.name]: event.target.value
                             }
                           })
                         }} type="text"/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3}>fCntUp : </Label>
                <Col sm={9}>
                  <Input name="fCntUp"
                         onChange={(event) => {
                           this.setState({
                             ABP: {
                               ...this.state.ABP,
                               [event.target.name]: event.target.value
                             }
                           })
                         }} type="text"/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3}>nwkSKey : </Label>
                <Col sm={9}>
                  <Input name="nwkSKey"
                         onChange={(event) => {
                           this.setState({
                             ABP: {
                               ...this.state.ABP,
                               [event.target.name]: event.target.value
                             }
                           })
                         }} type="text"/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3}>skipFCntCheck : </Label>
                <Col sm={9}>
                  <Input name="skipFCntCheck"
                         onChange={(event) => {
                           this.setState({
                             ABP: {
                               ...this.state.ABP,
                               [event.target.name]: event.target.value
                             }
                           })
                         }} type="text"/>
                </Col>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" className="ml-1" onClick={() => {
              this.toggleABP()
              this.props.dispatch(activeThingAction(this.state.ABP,
                this.state.selectedThing, this.state.project._id, this.callback))
            }}>ارسال</Button>
            <Button color="danger" onClick={this.toggleABP}>انصراف</Button>
          </ModalFooter>
        </Modal>

        <div className="row">
          <div className="col-md-12 col-lg-6">
            <Card className="text-justify">
              <CardHeader>
                <CardTitle className="mb-0 font-weight-bold h6">تغییر اطلاعات پروژه</CardTitle>
              </CardHeader>
              <CardBody>
                <Form>
                  <FormGroup style={{display: 'flex'}}>
                    <div style={{minWidth: '65px', width: '20%'}}>
                      <Label>نام پروژه : </Label>
                    </div>
                    <div style={{width: '80%'}}>
                      <Input type="text" onChange={(event) => {
                        this.setState({
                          project: {
                            ...this.state.project,
                            name: event.target.value
                          }
                        })
                      }} value={this.state.project.name || ''}/>
                    </div>
                  </FormGroup>
                  <FormGroup style={{display: 'flex'}}>
                    <div style={{minWidth: '65px', width: '20%'}}>
                      <Label>توضیحات :‌ </Label>
                    </div>
                    <div style={{width: '80%'}}>
                      <Input value={this.state.project.description || ''} onChange={(event) => {
                        this.setState({
                          project: {
                            ...this.state.project,
                            description: event.target.value
                          }
                        })
                      }} type="textarea" name="" rows="2"/>
                    </div>
                  </FormGroup>

                </Form>
              </CardBody>
              <CardFooter>
                <Button onClick={() => {
                  this.props.dispatch(editProjectAction(this.state.project._id, {
                    name: this.state.project.name,
                    description: this.state.project.description
                  }))
                }} color="primary">ثبت اطلاعات</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="col-md-12 col-lg-6">
            <Card className="text-justify">
              <CardHeader>
                <CardTitle className="mb-0 font-weight-bold h6">نام مستعار کلید داده‌ها</CardTitle>
              </CardHeader>
              <CardBody>
                <Form className='row'>
                  <table className="table">
                    <thead>
                    <tr>
                      <th scope="col">ردیف</th>
                      <th scope="col">مقدار اصلی</th>
                      <th scope="col">نام مستعار</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderAliasTd(this.state.project.aliases)}

                    <tr>
                      <td><input ref={input => this.el_refs.alias.key = input}
                                 onChange={(event) => {
                                   this.setState({
                                     newAlias: {
                                       ...this.state.newAlias,
                                       key: event.target.value
                                     }
                                   })
                                 }}
                                 type="text" className="form-control" placeholder={'مقدار اصلی'}/>
                      </td>
                      <td><input ref={input => this.el_refs.alias.value = input}
                                 onChange={(event) => {
                                   this.setState({
                                     newAlias: {
                                       ...this.state.newAlias,
                                       alias: event.target.value
                                     }
                                   })
                                 }} type="text" className="form-control"
                                 placeholder={'نام مستعار'}/>
                      </td>
                      <td>
                        <button onClick={() => {
                          const newAlias = this.state.newAlias;
                          if (!newAlias.key || !newAlias.alias) {
                            toast('اطلاعات را کامل وارد کنید', {
                              position: toast.POSITION.BOTTOM_LEFT,
                              className: css({
                                background: '#fee2e1',
                                color: '#813838',
                              }),
                            });
                            return;
                          }
                          this.setState({
                            project: {
                              ...this.state.project,
                              aliases: {
                                ...this.state.project.aliases,
                                [newAlias.key]: newAlias.alias
                              }
                            }
                          })
                          this.el_refs.alias.key.value = '';
                          this.el_refs.alias.value.value = '';

                        }} type="button" className="btn btn-primary">اضافه کردن
                        </button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Form>
              </CardBody>
              <CardFooter>
                <Button onClick={() => {
                  this.props.dispatch(editAliasesAction(this.state.project._id, {
                    aliases: JSON.stringify(this.state.project.aliases)
                  }))
                }} color="primary">ثبت</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Card className="text-justify">
          <CardHeader>
            <CardTitle className="mb-0 font-weight-bold h6">اشیا متصل شده به پروژه</CardTitle>
          </CardHeader>
          <CardBody>
            <Table hover responsive className="table-outline">
              <thead className="thead-light">
              <tr>
                <th>#</th>
                <th>نام شی</th>
                <th>آدرس</th>
                <th>نوع</th>
                <th>امکانات</th>
              </tr>
              </thead>
              <tbody>
              {
                this.state.project.things !== undefined ?
                  this.state.project.things.map((thing, key) => {
                    return (this.renderThingItem(thing, key))
                  }) : undefined
              }
              </tbody>
            </Table>
          </CardBody>
          <CardFooter>
            <Button onClick={this.addThing} className="ml-1" color="primary">افزودن شی</Button>
            <Button onClick={this.uploadExcel} className="ml-1" color="success">افزودن دسته ای شی</Button>
          </CardFooter>
        </Card>

        <Card className="text-justify">
          <CardHeader>
            <CardTitle className="mb-0 font-weight-bold h6">انتخاب سناریو پروژه</CardTitle>
          </CardHeader>
          <CardBody>
            <ListGroup className="p-0">
              {
                this.renderScenarios()
              }
            </ListGroup>
          </CardBody>
          <CardFooter>
            <Button onClick={this.addScenario} color="primary">افزودن سناریو</Button>
          </CardFooter>
        </Card>


        <Card className="text-justify">
          <CardHeader>
            <CardTitle className="mb-0 font-weight-bold h6">لیست قالب های codec</CardTitle>
          </CardHeader>
          <CardBody>
            <ListGroup className="p-0">
              {
                this.renderCodecs()
              }
            </ListGroup>
          </CardBody>
          <CardFooter>
            <Button onClick={this.addTemplate} color="primary">افزودن قالب</Button>
          </CardFooter>
        </Card>
        <Logger project={this.state.project._id} />
      </div>
    );
  }

  renderScenarioItem(scenario) {
    return (
      <ListGroupItem active={scenario.is_active} className="justify-content-between">
        {scenario.name}
        <Button onClick={() => this.deleteScenarioModalToggle(scenario._id)}
                className="ml-1 float-left" color="danger" size="sm">حذف</Button>
        <Button className="ml-1 float-left" onClick={() => {
          window.location = `#/scenario/${this.state.project._id}/${scenario._id}`
        }} color="warning" size="sm">ویرایش</Button>
        <Button onClick={() => {
          this.props.dispatch(activateScenarioAction(this.state.project._id, scenario._id))
        }} disabled={scenario.is_active} className="ml-1 float-left" color="success" size="sm">فعال
          سازی</Button>

      </ListGroupItem>
    )
  }


  renderTemplateItem(template) {
    return (
      <ListGroupItem className="justify-content-between">
        {template.name}
        <Button onClick={() => this.deleteCodecModalToggle(template._id)}
                className="ml-1 float-left" color="danger" size="sm">حذف</Button>
        <Button className="ml-1 float-left" color="warning" size="sm">ویرایش</Button>
      </ListGroupItem>
    )
  }

  renderThingItem(thing, key) {
    let badgeColor = "success"
    switch(thing.last_seen_at.status){
      case 'gray':
        badgeColor = 'secondary'
    }

    return (
      <tr key={key}>
        <th>{key + 1}</th>
        <td>{thing.name}</td>
        <td className="english">{thing.interface.devEUI}</td>
        <td>{thing.type}</td>
        <td>
          <Button className="ml-1" onClick={() => {
            thing.type === 'ABP' ? this.toggleABP() : this.toggleOTAA()
            this.setState({
              selectedThing: thing._id
            })
          }}
                  color="success" size="sm">فعال سازی</Button>
          <Button onClick={() => {
            window.location = `#/things/${this.state.project._id}/${thing._id}`
          }} className="ml-1" color="warning" size="sm">ویرایش</Button>
          <Button onClick={() => {
            window.location = `#/codec/${this.state.project._id}/${thing._id}`
          }} className="ml-1" color="secondary" size="sm">ارسال codec</Button>
          <Button onClick={() => this.dataModalToggle(thing._id)} className="ml-1" color="primary" size="sm">ارسال
            داده (داون لینک)</Button>
          <Button onClick={() => this.deleteThingModalToggle(thing._id)} className="ml-1" color="danger"
                  size="sm">حذف شئ</Button>
          <Badge id={`key-${key}`}  color={badgeColor}>وضعیت </Badge>
          <Tooltip placement="top" isOpen={this.state.tooltipOpen[key]} target={`key-${key}`}  toggle={()=>this.toggle(key)}>
            {thing.last_seen_at.time}
          </Tooltip>
        </td>
      </tr>
    )
  }

  toggle(key) {
    let tooltipOpen = this.state.tooltipOpen;
    tooltipOpen[key] = tooltipOpen[key]==undefined  ||  !tooltipOpen[key] ? true : false
    console.log(tooltipOpen)
    this.setState({
      tooltipOpen
    });
  }


  renderAliasTd(aliases) {
    aliases = aliases ? aliases : [];

    return Object.keys(aliases).map((key, index) => {
      return <tr key={key}>
        <td>{index + 1}</td>
        <td>{key}</td>
        <td>
          {aliases[key]}
          <Button color="danger" onClick={this.deleteAlias} value={key}
                  className="btn-sm" style={{float: 'left'}}>&times;</Button>
        </td>
      </tr>
    })
  }

  renderDownlinkRow(id, key, value) {
    return (
      <FormGroup row key={id}>
        <Col sm={5}>
          <Input type="text" value={key} onChange={(e) => {
            const newRows = [...this.state.modalDownlinkRows];
            const item = newRows.findIndex(item => item.id == id)
            newRows[item].key = e.target.value;
            this.setState({modalDownlinkRows: newRows})
          }} placeholder="کلید"/>
        </Col>
        <Col sm={5}>
          <Input type="text" value={value} onChange={(e) => {
            const newRows = [...this.state.modalDownlinkRows];
            const item = newRows.findIndex(item => item.id == id)
            newRows[item].value = e.target.value;
            this.setState({modalDownlinkRows: newRows})
          }} placeholder="مقدار"/>
        </Col>
        <Col sm={2} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Button color="danger" onClick={() => {
            this.setState({
              modalDownlinkRows: this.state.modalDownlinkRows.filter((value) => value.id != id)
            })
          }} className="btn-sm" style={{float: 'left'}}>&times;</Button>
        </Col>
      </FormGroup>
    )

  }

  deleteAlias(event) {
    const key = event.target.value;
    const newState = {
      project: {
        ...this.state.project,
        aliases: {
          ...this.state.project.aliases,
        }
      }
    };
    delete newState.project.aliases[key];
    this.setState(newState)
  }

  dataModalToggle(id) {
    this.setState({
      dataModal: !this.state.dataModal,
      modalDownlinkRows: [],
      DownlinkThingRowId: id
    });
  }

  uploadExcel() {
    window.location = `#/things/excel/${this.state.project._id}`
  }

  addThing() {
    window.location = `#/things/${this.state.project._id}/new`
  }

  addScenario() {
    window.location = `#/scenario/${this.state.project._id}/new`
  }

  toggleOTAA() {
    this.setState({
      OTAAmodal: !this.state.OTAAmodal
    });
  }

  toggleABP() {
    this.setState({
      ABPmodel: !this.state.ABPmodel
    });
  }


  callback(status, message) {
    if (!status)
      toast(message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: css({
          background: '#fee2e1',
          color: '#813838',
        }),
        progressClassName: css({
          background: '#813838'
        })
      });
    else
      toast('با موفقیت انجام شد', {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: css({
          background: '#dbf2e3',
          color: '#28623c'
        }),
        progressClassName: css({
          background: '#28623c'
        })
      });
  }

  renderScenarios() {
    if (this.state.project.scenarios)
      return (this.state.project.scenarios.map(scenario => {
        return (this.renderScenarioItem(scenario))
      }))
  }

  renderCodecs() {
    if (this.state.project.templates)
      return (this.state.project.templates.map(template => {
        return (this.renderTemplateItem(template))
      }))
  }

  addTemplate() {
    window.location = `#/template/${this.state.project._id}/new`
  }


}

function mapStateToProps(state) {
  return {
    projects: state.projectReducer,
    loading: state.homeReducer.currentlySending
  };
}


export default connect(mapStateToProps)(ProjectsManage);
