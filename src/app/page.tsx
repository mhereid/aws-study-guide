‘use client’

import { useState, useEffect } from ‘react’
import { supabase, Question } from ‘@/lib/supabase’
import { CheckCircle, XCircle, Upload, Play, RotateCcw } from ‘lucide-react’

export default function Home() {
const [questions, setQuestions] = useState<Question[]>([])
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
const [showAnswer, setShowAnswer] = useState(false)
const [score, setScore] = useState({ correct: 0, total: 0 })
const [isLoading, setIsLoading] = useState(true)
const [quizMode, setQuizMode] = useState<‘upload’ | ‘quiz’ | ‘results’>(‘upload’)

useEffect(() => {
loadQuestions()
}, [])

const loadQuestions = async () => {
try {
const { data, error } = await supabase
.from(‘questions’)
.select(’*’)
.order(‘created_at’, { ascending: false })

```
  if (error) throw error
  setQuestions(data || [])
  if (data && data.length > 0) {
    setQuizMode('quiz')
  }
} catch (error) {
  console.error('Error loading questions:', error)
} finally {
  setIsLoading(false)
}
```

}

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
const file = event.target.files?.[0]
if (!file) return

```
try {
  const text = await file.text()
  const questionsData = JSON.parse(text)
  
  const { error } = await supabase
    .from('questions')
    .insert(questionsData)

  if (error) throw error
  
  await loadQuestions()
  alert('Questions uploaded successfully!')
} catch (error) {
  console.error('Error uploading questions:', error)
  alert('Error uploading questions. Please check the file format.')
}
```

}

const handleAnswerSelect = (answerIndex: number) => {
if (showAnswer) return
setSelectedAnswer(answerIndex)
}

const handleSubmitAnswer = () => {
if (selectedAnswer === null) return

```
setShowAnswer(true)
const isCorrect = selectedAnswer === questions[currentQuestionIndex].correct_answer
setScore(prev => ({
  correct: prev.correct + (isCorrect ? 1 : 0),
  total: prev.total + 1
}))
```

}

const handleNextQuestion = () => {
if (currentQuestionIndex < questions.length - 1) {
setCurrentQuestionIndex(prev => prev + 1)
setSelectedAnswer(null)
setShowAnswer(false)
} else {
setQuizMode(‘results’)
}
}

const resetQuiz = () => {
setCurrentQuestionIndex(0)
setSelectedAnswer(null)
setShowAnswer(false)
setScore({ correct: 0, total: 0 })
setQuizMode(‘quiz’)
}

const currentQuestion = questions[currentQuestionIndex]

if (isLoading) {
return (
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
<div className="text-lg">Loading…</div>
</div>
)
}

return (
<div className="min-h-screen bg-gray-50 py-8">
<div className="max-w-4xl mx-auto px-4">
<h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
AWS Exam Study Guide
</h1>

```
    {quizMode === 'upload' && (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Upload className="mx-auto mb-4 text-blue-500" size={48} />
        <h2 className="text-xl font-semibold mb-4">Upload Your Questions</h2>
        <p className="text-gray-600 mb-6">
          Upload a JSON file containing your AWS exam questions
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="mt-6 text-sm text-gray-500">
          <p>Expected format: JSON array with question_text, options, correct_answer, etc.</p>
        </div>
      </div>
    )}

    {quizMode === 'quiz' && currentQuestion && (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="text-sm text-gray-500">
            Score: {score.correct}/{score.total}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {currentQuestion.question_text}
        </h2>

        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left border rounded-lg transition-all duration-200 "
            
            if (showAnswer) {
              if (index === currentQuestion.correct_answer) {
                buttonClass += "border-green-500 bg-green-50 text-green-800"
              } else if (index === selectedAnswer && index !== currentQuestion.correct_answer) {
                buttonClass += "border-red-500 bg-red-50 text-red-800"
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-600"
              }
            } else {
              if (index === selectedAnswer) {
                buttonClass += "border-blue-500 bg-blue-50 text-blue-800"
              } else {
                buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={buttonClass}
                disabled={showAnswer}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-full border flex items-center justify-center mr-3 text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                  {showAnswer && index === currentQuestion.correct_answer && (
                    <CheckCircle className="ml-auto text-green-500" size={20} />
                  )}
                  {showAnswer && index === selectedAnswer && index !== currentQuestion.correct_answer && (
                    <XCircle className="ml-auto text-red-500" size={20} />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {showAnswer && currentQuestion.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Explanation:</h3>
            <p className="text-blue-700">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-between">
          {!showAnswer ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
            </button>
          )}
        </div>
      </div>
    )}

    {quizMode === 'results' && (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Quiz Complete!</h2>
        
        <div className="text-4xl font-bold mb-4">
          <span className="text-green-600">{score.correct}</span>
          <span className="text-gray-400"> / </span>
          <span className="text-gray-600">{score.total}</span>
        </div>
        
        <div className="text-xl mb-6 text-gray-600">
          {Math.round((score.correct / score.total) * 100)}% Correct
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetQuiz}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Retake Quiz
          </button>
        </div>
      </div>
    )}

    {questions.length > 0 && quizMode !== 'quiz' && (
      <div className="text-center mt-6">
        <button
          onClick={() => setQuizMode('quiz')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
        >
          <Play size={16} />
          Start Quiz ({questions.length} questions)
        </button>
      </div>
    )}
  </div>
</div>
```

)
}