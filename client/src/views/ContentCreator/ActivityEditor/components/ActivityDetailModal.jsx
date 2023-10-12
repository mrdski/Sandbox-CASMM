import { Button, Form, Input, message, Modal } from "antd"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getActivity,
  getActivityToolbox,
  getActivityToolboxAll,
  getLessonModuleActivities,
  updateActivityDetails,
} from "../../../../Utils/requests"
import "../ActivityEditor.less"
import ActivityComponentTags from "./ActivityComponentTags"

const SCIENCE = 1
const MAKING = 2
const COMPUTATION = 3

const ActivityDetailModal = ({
  learningStandard,
  selectActivity,
  setActivityDetailsVisible,
  setActivities,
  viewing,
}) => {
  const [description, setDescription] = useState("")
  //const [template, setTemplate] = useState("")
  const [StandardS, setStandardS] = useState("")
  const [images, setImages] = useState("")
  const [link, setLink] = useState("")

  const [scienceComponents, setScienceComponents] = useState([])
  const [makingComponents, setMakingComponents] = useState([])
  const [computationComponents, setComputationComponents] = useState([])

  const [linkError, setLinkError] = useState(false)
  const [submitButton, setSubmitButton] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const showActivityDetailsModal = async () => {
      const response = await getActivity(selectActivity.id)
      if (response.err) {
        message.error(response.err)
        return
      }
      setDescription(response.data.description)
      //setTemplate(response.data.template)
      setStandardS(response.data.StandardS)
      setImages(response.data.images)
      setLink(response.data.link)
      setLinkError(false)
      const science = response.data.learning_components
        .filter(component => component.learning_component_type === SCIENCE)
        .map(element => {
          return element.type
        })
      setScienceComponents(science)

      const making = response.data.learning_components
        .filter(component => component.learning_component_type === MAKING)
        .map(element => {
          return element.type
        })
      setMakingComponents(making)

      const computation = response.data.learning_components
        .filter(component => component.learning_component_type === COMPUTATION)
        .map(element => {
          return element.type
        })
      setComputationComponents(computation)
    }
    showActivityDetailsModal()
  }, [selectActivity])

  const checkURL = n => {
    const regex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
    if (n.search(regex) === -1) {
      return null
    }
    return n
  }

  const handleViewActivityLevelTemplate = async activity => {
    const allToolBoxRes = await getActivityToolboxAll()
    const selectedToolBoxRes = await getActivityToolbox(activity.id)
    activity.selectedToolbox = selectedToolBoxRes.data.toolbox
    activity.toolbox = allToolBoxRes.data.toolbox

    activity.lesson_module_name = learningStandard.name
    localStorage.setItem("my-activity", JSON.stringify(activity))
    navigate("/activity")
  }

  const handleViewActivityTemplate = async activity => {
    const allToolBoxRes = await getActivityToolboxAll()
    delete activity.selectedToolbox
    activity.toolbox = allToolBoxRes.data.toolbox

    activity.lesson_module_name = learningStandard.name
    localStorage.setItem("my-activity", JSON.stringify(activity))
    navigate("/activity")
  }

  const handleSave = async () => {
    if (link) {
      const goodLink = checkURL(link)
      if (!goodLink) {
        setLinkError(true)
        message.error("Please Enter a valid URL starting with HTTP/HTTPS", 4)
        return
      }
    }
    setLinkError(false)
    const res = await updateActivityDetails(
      selectActivity.id,
      description,
      //template,
      StandardS,
      images,
      link,
      scienceComponents,
      makingComponents,
      computationComponents
    )
    if (res.err) {
      message.error(res.err)
    } else {
      message.success("Successfully saved activity")
      // just save the form
      if (submitButton === 0) {
        const getActivityAll = await getLessonModuleActivities(viewing)
        const myActivities = getActivityAll.data
        myActivities.sort((a, b) => (a.number > b.number ? 1 : -1))
        setActivities([...myActivities])
        // save the form and go to workspace
      } else if (submitButton === 1) {
        setActivityDetailsVisible(false)
        handleViewActivityLevelTemplate(res.data)
      } else if (submitButton === 2) {
        setActivityDetailsVisible(false)
        handleViewActivityTemplate(res.data)
      }
    }
  }

  return (
    <Modal
      title="Selected Activity Details Editor"
      open={true}
      onCancel={() => setActivityDetailsVisible(false)}
      footer={null}
      width="45vw"
    >
      <Form
        id="activity-detail-editor"
        layout="horizontal"
        size="default"
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 14,
        }}
        onFinish={handleSave}
      >
        <Form.Item id="form-label" label="Description">
          <Input.TextArea
            onChange={e => setDescription(e.target.value)}
            value={description}
            required
            placeholder="Enter description"
          ></Input.TextArea>
        </Form.Item>
        {/* <Form.Item id="form-label" label="Student Template">
          <Input
            onChange={e => setTemplate(e.target.value)}
            value={template}
            //className="input"
            placeholder="Enter code template"
          ></Input>
        </Form.Item> */}
        <Form.Item id="form-label" label="Standards">
          <Input
            onChange={e => setStandardS(e.target.value)}
            value={StandardS}
            className="input"
            required
            placeholder="Enter standards"
          ></Input>
        </Form.Item>
        <Form.Item id="form-label" label="Images">
          <Input.TextArea
            onChange={e => setImages(e.target.value)}
            value={images}
            className="input"
            placeholder="Enter image URL"
          ></Input.TextArea>
        </Form.Item>
        <h3 id="subtitle">Lesson Learning Components</h3>
        <Form.Item id="form-label" label="Science Component">
          <ActivityComponentTags
            components={scienceComponents}
            setComponents={setScienceComponents}
            colorOffset={1}
          />
        </Form.Item>
        <Form.Item id="form-label" label="Maker Component">
          <ActivityComponentTags
            components={makingComponents}
            setComponents={setMakingComponents}
            colorOffset={4}
          />
        </Form.Item>
        <Form.Item id="form-label" label="Computation Component">
          <ActivityComponentTags
            components={computationComponents}
            setComponents={setComputationComponents}
            colorOffset={7}
          />
        </Form.Item>
        <h3 id="subtitle">Additional Information</h3>
        <Form.Item
          id="form-label"
          label="Link to Additional Resources (Optional)"
        >
          <Input
            onChange={e => {
              setLink(e.target.value)
              setLinkError(false)
            }}
            className="input"
            value={link}
            style={linkError ? { backgroundColor: "#FFCCCC" } : {}}
            placeholder="Enter a link"
          ></Input>
        </Form.Item>
        <Form.Item
          id="form-label"
          wrapperCol={{
            offset: 6,
            span: 30,
          }}
        >
          <button id="save--set-activity-btn" onClick={() => setSubmitButton(1)}>
            Save and Set
            <br />
            Activity Template
          </button>
          <button id="save--set-demo-btn" onClick={() => setSubmitButton(2)}>
            Save and Set
            <br />
            Demo Template
          </button>
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
          style={{ marginBottom: "0px" }}
        >
          <Button
            onClick={() => setSubmitButton(0)}
            type="primary"
            htmlType="submit"
            size="large"
            className="content-creator-button"
          >
            Save
          </Button>
          <Button
            onClick={() => setActivityDetailsVisible(false)}
            size="large"
            className="content-creator-button"
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ActivityDetailModal
