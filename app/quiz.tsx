
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

interface Question {
  question: string;
  correctAnswer: number;
  options: number[];
}

const QUESTION_TIME = 15; // seconds
const POINTS_CORRECT = 100;
const POINTS_INCORRECT = -25;

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Generate random math questions with increased difficulty
  const generateQuestion = useCallback((): Question => {
    const operations = ['+', '-', '*', '/', '^', 'multi'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, correctAnswer: number, questionText: string;
    
    switch (operation) {
      case '+':
        // Larger numbers for addition
        num1 = Math.floor(Math.random() * 150) + 50;
        num2 = Math.floor(Math.random() * 150) + 50;
        correctAnswer = num1 + num2;
        questionText = `${num1} + ${num2} = ?`;
        break;
      case '-':
        // Larger numbers for subtraction
        num1 = Math.floor(Math.random() * 200) + 100;
        num2 = Math.floor(Math.random() * 100) + 25;
        correctAnswer = num1 - num2;
        questionText = `${num1} - ${num2} = ?`;
        break;
      case '*':
        // Larger multiplication
        num1 = Math.floor(Math.random() * 25) + 5;
        num2 = Math.floor(Math.random() * 15) + 3;
        correctAnswer = num1 * num2;
        questionText = `${num1} × ${num2} = ?`;
        break;
      case '/':
        // Division with whole number results
        correctAnswer = Math.floor(Math.random() * 20) + 5;
        num2 = Math.floor(Math.random() * 8) + 2;
        num1 = correctAnswer * num2;
        questionText = `${num1} ÷ ${num2} = ?`;
        break;
      case '^':
        // Simple exponents
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 3) + 2;
        correctAnswer = Math.pow(num1, num2);
        questionText = `${num1}² = ?`;
        if (num2 === 3) questionText = `${num1}³ = ?`;
        break;
      case 'multi':
        // Multi-step problems
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        const c = Math.floor(Math.random() * 5) + 1;
        correctAnswer = (a + b) * c;
        questionText = `(${a} + ${b}) × ${c} = ?`;
        break;
      default:
        num1 = 1;
        num2 = 1;
        correctAnswer = 2;
        questionText = '1 + 1 = ?';
    }

    // Generate wrong answers with better distribution
    const wrongAnswers: number[] = [];
    while (wrongAnswers.length < 3) {
      let wrongAnswer: number;
      
      if (operation === '^' || operation === 'multi') {
        // For complex operations, create more realistic wrong answers
        const variance = Math.max(Math.floor(correctAnswer * 0.3), 10);
        wrongAnswer = correctAnswer + Math.floor(Math.random() * variance * 2) - variance;
      } else if (operation === '/') {
        // For division, create answers that might result from common mistakes
        const commonMistakes = [
          correctAnswer + 1,
          correctAnswer - 1,
          Math.floor(correctAnswer * 1.5),
          Math.floor(correctAnswer / 2)
        ];
        wrongAnswer = commonMistakes[Math.floor(Math.random() * commonMistakes.length)];
      } else {
        // For basic operations, use percentage-based variance
        const variance = Math.max(Math.floor(correctAnswer * 0.4), 15);
        wrongAnswer = correctAnswer + Math.floor(Math.random() * variance * 2) - variance;
      }
      
      if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer) && wrongAnswer > 0) {
        wrongAnswers.push(wrongAnswer);
      }
    }

    // Shuffle options
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    return {
      question: questionText,
      correctAnswer,
      options,
    };
  }, []);

  // Initialize questions
  useEffect(() => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      newQuestions.push(generateQuestion());
    }
    setQuestions(newQuestions);
  }, [generateQuestion]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameEnded || showResult) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up
      handleTimeUp();
    }
  }, [timeLeft, gameStarted, gameEnded, showResult]);

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(QUESTION_TIME);
    setGameEnded(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleTimeUp = () => {
    console.log('Time up!');
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setScore(prev => prev + POINTS_INCORRECT);
    nextQuestion();
  };

  const handleAnswer = (selectedOption: number) => {
    if (showResult) return;
    
    setSelectedAnswer(selectedOption);
    setShowResult(true);
    
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(
        isCorrect 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Error
      );
    }
    
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 2);
      setScore(prev => prev + POINTS_CORRECT + timeBonus);
    } else {
      setScore(prev => prev + POINTS_INCORRECT);
    }

    // Show result for 2 seconds then move to next question
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(QUESTION_TIME);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameEnded(true);
    console.log(`Game ended with score: ${score}`);
  };

  const restartGame = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      newQuestions.push(generateQuestion());
    }
    setQuestions(newQuestions);
    startGame();
  };

  const getAnswerButtonColor = (option: number, index: number) => {
    const answerColors = [colors.answerRed, colors.answerOrange, colors.answerGreen, colors.answerBlue];
    
    if (!showResult) {
      return answerColors[index];
    }
    
    const currentQ = questions[currentQuestion];
    if (option === currentQ.correctAnswer) {
      return colors.answerGreen; // Correct answer is always green
    } else if (option === selectedAnswer) {
      return colors.answerRed; // Wrong selected answer is red
    } else {
      return answerColors[index]; // Other options keep their original color but dimmed
    }
  };

  const getAnswerButtonOpacity = (option: number) => {
    if (!showResult) return 1;
    
    const currentQ = questions[currentQuestion];
    if (option === currentQ.correctAnswer || option === selectedAnswer) {
      return 1;
    }
    return 0.5;
  };

  if (!gameStarted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: "Math Quiz",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.startScreen}>
          <Text style={styles.title}>🧮 Math Quiz Challenge</Text>
          <Text style={styles.subtitle}>Test your advanced calculation skills!</Text>
          
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionTitle}>How to Play:</Text>
            <Text style={styles.instruction}>• Answer 10 challenging math questions</Text>
            <Text style={styles.instruction}>• Includes: +, -, ×, ÷, exponents, multi-step</Text>
            <Text style={styles.instruction}>• Each question has 15 seconds</Text>
            <Text style={styles.instruction}>• Correct answer: +100 points + time bonus</Text>
            <Text style={styles.instruction}>• Wrong answer: -25 points</Text>
            <Text style={styles.instruction}>• Time up: -25 points</Text>
          </View>

          <Pressable style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (gameEnded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: "Quiz Complete",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.endScreen}>
          <Text style={styles.title}>🎉 Quiz Complete!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          
          <View style={styles.statsCard}>
            <Text style={styles.statText}>Questions Answered: {questions.length}</Text>
            <Text style={styles.statText}>
              Average per Question: {Math.round(score / questions.length)}
            </Text>
          </View>

          <View style={styles.endButtons}>
            <Pressable style={styles.restartButton} onPress={restartGame}>
              <Text style={styles.restartButtonText}>Play Again</Text>
            </Pressable>
            
            <Pressable style={styles.homeButton} onPress={() => router.back()}>
              <Text style={styles.homeButtonText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: `Question ${currentQuestion + 1}/10`,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      
      {/* Header with score and timer */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        
        <View style={[styles.timerContainer, timeLeft <= 5 && styles.timerUrgent]}>
          <IconSymbol name="clock" size={20} color={timeLeft <= 5 ? colors.answerRed : colors.text} />
          <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextUrgent]}>
            {timeLeft}s
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>

      {/* Question - moved below timer bar */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQ.question}</Text>
      </View>

      {/* Result feedback - moved higher */}
<View style={styles.resultContainer}>
  {showResult && (
    <>
      <Text style={[
        styles.resultText,
        { color: selectedAnswer === currentQ.correctAnswer ? colors.answerGreen : colors.answerRed }
      ]}>
        {selectedAnswer === currentQ.correctAnswer ? '✅ Correct!' : '❌ Wrong!'}
      </Text>
      {selectedAnswer === currentQ.correctAnswer && (
        <Text style={styles.bonusText}>
          +{POINTS_CORRECT + Math.floor(timeLeft * 2)} points
        </Text>
      )}
    </>
  )}
</View>

      {/* Answer options - moved higher */}
      <View style={styles.answersContainer}>
        {currentQ.options.map((option, index) => (
          <Pressable
            key={index}
            style={[
              styles.answerButton,
              { 
                backgroundColor: getAnswerButtonColor(option, index),
                opacity: getAnswerButtonOpacity(option)
              }
            ]}
            onPress={() => handleAnswer(option)}
            disabled={showResult}
          >
            <Text style={styles.answerText}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  endScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  instructionsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  instruction: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    boxShadow: '0px 4px 12px rgba(0, 123, 255, 0.3)',
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  timerUrgent: {
    backgroundColor: '#FFE5E5',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 5,
  },
  timerTextUrgent: {
    color: colors.answerRed,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  resultContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bonusText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  answersContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: 'flex-start',
  },
  answerButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  answerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  finalScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  endButtons: {
    width: '100%',
    maxWidth: 300,
  },
  restartButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    boxShadow: '0px 4px 12px rgba(0, 123, 255, 0.3)',
    elevation: 4,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(108, 117, 125, 0.3)',
    elevation: 4,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
