import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatbotService } from '../Shared/ChatBotService/chatbot';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { UserService } from '../Shared/Custom-Services/user-service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.html',
  imports: [FormsModule, CommonModule, HttpClientModule],
  styleUrls: ['./chatbot.scss']
})
export class Chat implements OnInit{

  messages: any[] = [];
  userInput = '';
  isTyping = false;
  isChatOpen = false;
  userName = '';
  userRole: null|string=null;
  recognition: any;
  isListening = false;
  liveTranscript = '';

  isWaitingForAccountNumber = false;

  constructor(
    private chatService: ChatbotService,
    private router: Router,
    private authState: AuthService,
    private zone: NgZone,
    private userService: UserService,
  ) {
    this.initVoice();
  }

  ngOnInit() {
    this.initBot();
    this.userRole = this.authState.role();
  }
  initVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.zone.run(() => {
        this.isListening = true;
        this.liveTranscript = '';
      });
    };

    this.recognition.onresult = (event: any) => {
      this.zone.run(() => {

        let interim = '';
        let finalText = '';

        for (let i = 0; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalText += t + ' ';
          } else {
            interim += t;
          }
        }

        this.liveTranscript = interim || finalText;

        if (finalText.trim()) {
          this.messages.push({
            sender: 'user',
            text: finalText.trim()
          });

          this.userInput = finalText.trim();
          this.recognition.stop();
          this.sendMessage(true);
        }
      });
    };

    this.recognition.onend = () => {
      this.zone.run(() => {
        this.isListening = false;
        this.liveTranscript = '';
      });
    };
  }

  startListening() {
    try { this.recognition.start(); } catch { }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    const user = this.authState.user();
    this.userName = user?.fullName || 'Guest';
    console.log(this.userName);
    if (this.userName=='Guest') { this.resetChat(); }
    console.log(this.messages);
    
    if (this.isChatOpen && this.messages.length === 0) {
      setTimeout(() => this.initBot(), 300);
    }
  }
  
  initBot() {
   

    if (this.userName!='Guest') {
      this.messages.push({
        sender: 'bot',
        text: `Hi ${this.userName}, I'm Nancy. How can I help you today?`,
        options: [
          'View Accounts',
          'Check Balance',
          'Transactions',
          'Transfer Money',
          'Profile',
          'Reset Password',
          'Account Application Status'
        ]
      });
    } else {
      this.messages.push({
        sender: 'bot',
        text: `Hi ${this.userName}, I'm Nancy. Please login to access banking services.`,
        button: {
          label: 'Login',
          route: '/login'
        }
      });
    }

    this.scrollBottom();
  }

  sendMessage(isVoice: boolean = false) {
    if (!this.userInput.trim()) return;

    const text = this.userInput.trim();
    const user = this.authState.user();
    const userName = user?.fullName || 'Guest';
    const isLoggedIn = !!user;

    if (!isVoice) {
      this.messages.push({ sender: 'user', text });
    }

    this.userInput = '';

    if (this.isWaitingForAccountNumber) {
      this.isWaitingForAccountNumber = false;
      this.getAccountStatus(text);
      return;
    }

    if (text.toLowerCase().includes('account application status')) {
      if (!isLoggedIn) {
        this.messages.push({
          sender: 'bot',
          text: 'Please login to check your application status.',
          button: {
            label: 'Login',
            route: '/login'
          }
        });
        return;
      }

      this.isWaitingForAccountNumber = true;

      this.messages.push({
        sender: 'bot',
        text: 'Please enter your application number to check the status.'
      });
      return;
    }
    const restrictedPatterns = [
      /account details|view my accounts/i,
      /balance|money|amount/i,
      /transaction|history|statement/i,
      /transfer|send|pay/i,
      /profile|my info|my details/i,
      /application status|status/i
    ];

    const isRestricted = restrictedPatterns.some(pattern => pattern.test(text));

    if (!isLoggedIn && isRestricted) {
      this.messages.push({
        sender: 'bot',
        text: 'Please login to access this feature.',
        button: {
          label: 'Login',
          route: '/login'
        }
      });

      return;
    }

    this.isTyping = true;

    this.chatService.askBot(text, userName).subscribe({
      next: (res) => {
        this.isTyping = false;

        const parsed = this.parseResponse(res.response.result);

        this.messages.push({
          sender: 'bot',
          text: parsed.text,
          button: parsed.button
        });

        this.scrollBottom();
      },
      error: () => {
        this.isTyping = false;
        this.messages.push({
          sender: 'bot',
          text: 'Error connecting to Bot'
        });
      }
    });
  }

  getAccountStatus(accountNumber: string) {
    this.isTyping = true;

    const accNo = Number(accountNumber);

    this.userService.getAccountByAccountNumber(accNo).subscribe({
      next: (res: any) => {
        this.isTyping = false;

        if (!res || res.data == null) {
          this.messages.push({
            sender: 'bot',
            text: 'Invalid application number. Please try again.'
          });
          return;
        }

        const statusMap: any = {
          1: 'Approved',
          0: 'Pending',
          [-1]: 'Rejected'
        };

        const statusText = statusMap[res.data.accountStatus] || 'Unknown';

        this.messages.push({
          sender: 'bot',
          text: `Your application status is: ${statusText}`
        });

        this.scrollBottom();
      },
      error: () => {
        this.isTyping = false;
        this.messages.push({
          sender: 'bot',
          text: 'Unable to fetch status. Please try again later.'
        });
      }
    });
  }

  parseResponse(res: string) {
    const btnMatch = res.match(/\[NAV_BUTTON:\s*(.*?)\s*:\s*(.*?)\s*\]/);

    if (btnMatch) {
      return {
        text: res.replace(btnMatch[0], '').trim(),
        button: {
          label: btnMatch[1].trim(),
          route: btnMatch[2].trim()
        }
      };
    }

    return { text: res };
  }

  goTo(route: string) {
    this.router.navigate([route]);
    this.isChatOpen = false;
  }

  sendQuick(option: string) {
    this.userInput = option;
    this.sendMessage();
  }

  scrollBottom() {
    setTimeout(() => {
      const box = document.querySelector('.chat-box');
      if (box) box.scrollTop = box.scrollHeight;
    }, 50);
  }

  resetChat() {
    this.messages = [];
  }
}