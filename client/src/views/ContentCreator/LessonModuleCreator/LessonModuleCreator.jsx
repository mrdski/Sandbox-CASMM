import { Button, Form, Input, message, Modal } from "antd"
import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  createActivity,
  createLessonModule,
  getAllUnits,
  getLessonModuleAll,
} from "../../../Utils/requests"
import ActivityEditor from "../ActivityEditor/ActivityEditor"
import "./LessonModuleCreator.less"

export default function LessonModuleCreator({
  setLessonModuleList,
  viewing,
  setViewing,
}) {
  const [visible, setVisible] = useState(false)
  const [unitList, setUnitList] = useState([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [unit, setUnit] = useState("")
  const [numOfActivityLevels, setNumOfActivityLevels] = useState("")
  const [standards, setStandards] = useState("")
  const [link, setLink] = useState("")
  const [linkError, setLinkError] = useState(false)
  const [learningStandardObj, setLessonModuleObj] = useState("")
  // eslint-disable-next-line
  const [_, setSearchParams] = useSearchParams()

  let found

  useEffect(() => {
    const getUnits = async () => {
      const res = await getAllUnits()
      setUnitList(res.data)
    }
    getUnits()
  }, [])

  const showModal = async () => {
    const res = await getAllUnits()
    setUnitList(res.data)
    setDescription("")
    setName("")
    setStandards("")
    setLink("")
    setLinkError(false)
    setNumOfActivityLevels("")
    setVisible(true)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const handleSubmit = async () => {
    if (link) {
      const goodLink = checkURL(link)
      if (!goodLink) {
        setLinkError(true)
        message.error("Please Enter a valid URL starting with HTTP/HTTPS", 4)
        return
      }
    }
    setLinkError(false)
    const res = await createLessonModule(
      description,
      name,
      0,
      unit,
      standards,
      link
    )
    if (res.err) {
      message.error("Fail to create new learning standard")
    } else {
      for (let i = 1; i <= numOfActivityLevels; i++) {
        const activityRes = await createActivity(i, res.data)
        if (activityRes.err) {
          message.error("Fail to create activities")
        }
      }
      message.success("Successfully created lesson")
      const lsRes = await getLessonModuleAll()
      setLessonModuleList(lsRes.data)
      setLessonModuleObj(res.data)

      // find the position of the newly created ls
      found = lsRes.data.findIndex(ls => ls.id === res.data.id)
      found = Math.ceil(found / 10)
      // set the history so that modal will reopen when
      // user comes back from workspace
      setSearchParams({ tab: "home", activity: res.data.id })

      setViewing(res.data.id)
      setVisible(false)
    }
  }

  const checkURL = n => {
    const regex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
    if (n.search(regex) === -1) {
      return null
    }
    return n
  }

  return (
    <div>
      <button onClick={showModal} id="add-lesson-module-btn">
        + Add a Lesson
      </button>

      <Modal
        title="Create a Lesson"
        open={visible}
        width="35vw"
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          id="add-lesson-module"
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 14,
          }}
          onFinish={handleSubmit}
          layout="horizontal"
          size="default"
        >
          <Form.Item label="Unit Name">
            <select
              id="unit-name-dropdown"
              name="unit"
              defaultValue={unit}
              onChange={e => setUnit(e.target.value)}
              required
            >
              <option key={0} value={unit} id="disabled-option" disabled>
                Unit
              </option>
              {unitList.map(unit_ => (
                <option key={unit_.id} value={unit_.id}>
                  {unit_.name}
                </option>
              ))}
            </select>
          </Form.Item>
          <Form.Item label="Lesson Name">
            <Input
              onChange={e => setName(e.target.value)}
              value={name}
              required
              placeholder="Enter lesson name"
            />
          </Form.Item>
          <Form.Item label="Number of Activities">
            <Input
              onChange={e => {
                setNumOfActivityLevels(e.target.value)
              }}
              required
              value={numOfActivityLevels}
              placeholder="Enter number of activities"
              type="number"
              min={1}
              max={10}
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              rows={3}
              required
              onChange={e => {
                setDescription(e.target.value)
              }}
              value={description}
              placeholder="Enter lesson description"
            />
          </Form.Item>
          <Form.Item label="Standards">
            <Input
              onChange={e => {
                setStandards(e.target.value)
              }}
              required
              value={standards}
              placeholder="Enter lesson Standards"
            />
          </Form.Item>
          <Form.Item label="Link to Additional Resource (Optional)">
            <Input
              onChange={e => {
                setLink(e.target.value)
                setLinkError(false)
              }}
              style={linkError ? { backgroundColor: "#FFCCCC" } : {}}
              value={link}
              placeholder="Enter a link"
            />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
            style={{ marginBottom: "0px" }}
          >
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="content-creator-button"
            >
              Next
            </Button>
            <Button
              onClick={handleCancel}
              size="large"
              className="content-creator-button"
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {!visible ? (
        <ActivityEditor
          learningStandard={learningStandardObj}
          viewing={viewing}
          setViewing={setViewing}
          page={found}
          tab={"home"}
        />
      ) : null}
    </div>
  )
}
