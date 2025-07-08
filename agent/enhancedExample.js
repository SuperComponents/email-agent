// Enhanced ProResponse Agent Example
// Demonstrates email thread support, RAG integration, and thread naming
// Make sure you have a .env file with OPENAI_API_KEY=your-api-key

const { 
  assistSupportPersonEnhanced,
  generateThreadName,
  queryCompanyPolicies,
  AGENT_VERSION,
  AGENT_CAPABILITIES 
} = require('./dist/index');

async function runEnhancedExample() {
  console.log('🚀 Enhanced ProResponse Agent Example');
  console.log(`📋 Version: ${AGENT_VERSION}`);
  console.log(`✨ Capabilities:`, AGENT_CAPABILITIES);
  console.log('─'.repeat(80));
  
  try {
    // Step 1: Create a sample email thread (normally from backend)
    console.log('\n📧 Step 1: Creating sample email thread...');
    
    const emailThread = {
      id: 'thread-2024-001',
      subject: 'Premium subscription features not working - URGENT',
      customerEmail: 'john.doe@company.com',
      status: 'open',
      priority: 'high',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T14:30:00Z'),
      tags: ['premium', 'subscription'],
      messages: [
        {
          id: 'msg-001',
          threadId: 'thread-2024-001',
          from: 'john.doe@company.com',
          to: ['support@yourcompany.com'],
          subject: 'Premium subscription features not working - URGENT',
          body: `Hi Support Team,

I upgraded to premium last week (Order #PRE-2024-001) but I still don't have access to premium features. I've tried:
- Logging out and back in
- Clearing my browser cache  
- Checking my account settings

This is extremely frustrating as I need these features for an important client presentation tomorrow. I've been a customer for over 2 years and this is the third time I've had billing issues.

Can someone please help me ASAP? If this isn't resolved today, I'll have to consider switching to a competitor.

Thanks,
John Doe
Senior Marketing Manager
john.doe@company.com`,
          timestamp: new Date('2024-01-15T10:00:00Z'),
          isFromCustomer: true,
          priority: 'urgent'
        },
        {
          id: 'msg-002', 
          threadId: 'thread-2024-001',
          from: 'support@yourcompany.com',
          to: ['john.doe@company.com'],
          subject: 'Re: Premium subscription features not working - URGENT',
          body: `Dear John,

Thank you for contacting us. I understand your frustration and I'm here to help resolve this immediately.

I can see your premium upgrade order #PRE-2024-001 was processed successfully. Let me investigate the feature access issue right away and get back to you within the hour.

Best regards,
Sarah Wilson
Customer Support Team`,
          timestamp: new Date('2024-01-15T11:30:00Z'),
          isFromCustomer: false,
          priority: 'high'
        },
        {
          id: 'msg-003',
          threadId: 'thread-2024-001', 
          from: 'john.doe@company.com',
          to: ['support@yourcompany.com'],
          subject: 'Re: Premium subscription features not working - URGENT',
          body: `Hi Sarah,

It's been 3 hours and I still haven't heard back. This is completely unacceptable service. I have the client presentation in 2 hours and I NEED access to the premium analytics dashboard.

I'm considering involving my legal team if this isn't resolved immediately. This is breach of contract as I paid for premium features that I'm not receiving.

John`,
          timestamp: new Date('2024-01-15T14:30:00Z'),
          isFromCustomer: true,
          priority: 'urgent'
        }
      ]
    };

    console.log(`📊 Thread created with ${emailThread.messages.length} messages`);
    console.log(`👤 Customer: ${emailThread.customerEmail}`);
    console.log(`⚡ Priority: ${emailThread.priority}`);
    console.log(`📅 Time span: ${emailThread.createdAt.toLocaleString()} - ${emailThread.updatedAt.toLocaleString()}`);

    // Step 2: Create support context (normally from backend database)
    console.log('\n🔍 Step 2: Creating support context...');
    
    const supportContext = {
      customerHistory: {
        customerId: 'cust-john-doe-123',
        totalTickets: 7,
        resolvedTickets: 5,
        averageResolutionTime: 18.5,
        satisfactionScore: 3.2,
        lastInteraction: new Date('2024-01-10T09:00:00Z'),
        commonIssues: ['billing', 'premium features', 'account access'],
        preferredContactMethod: 'email'
      },
      orderInformation: [
        {
          orderId: 'PRE-2024-001',
          productName: 'Premium Subscription Annual',
          orderDate: new Date('2024-01-08T00:00:00Z'),
          status: 'delivered',
          amount: 299.99,
          currency: 'USD',
          trackingNumber: 'PREMIUM-ACTIVATE-001'
        },
        {
          orderId: 'STD-2022-056',
          productName: 'Standard Plan',
          orderDate: new Date('2022-03-15T00:00:00Z'),
          status: 'delivered',
          amount: 99.99,
          currency: 'USD'
        }
      ],
      accountDetails: {
        customerId: 'cust-john-doe-123',
        email: 'john.doe@company.com',
        name: 'John Doe',
        accountType: 'premium',
        subscriptionStatus: 'active',
        joinDate: new Date('2022-03-15T00:00:00Z'),
        lastLogin: new Date('2024-01-15T09:45:00Z'),
        billingStatus: 'current'
      },
      escalationLevel: 'none',
      urgencyReason: 'Customer threatening legal action and competitor switch',
      internalNotes: [
        'Customer has been escalated twice in past 6 months',
        'Previous billing issues resolved with account credits',
        'VIP customer - high value account'
      ]
    };

    console.log(`📈 Customer history: ${supportContext.customerHistory.totalTickets} total tickets`);
    console.log(`💰 Recent order: ${supportContext.orderInformation[0].orderId} - $${supportContext.orderInformation[0].amount}`);
    console.log(`👑 Account type: ${supportContext.accountDetails.accountType}`);
    console.log(`⚠️  Urgency: ${supportContext.urgencyReason}`);

    // Step 3: Configure enhanced agent
    console.log('\n⚙️  Step 3: Configuring enhanced agent...');
    
    const agentConfig = {
      model: 'gpt-4o',
      includeRAG: true,
      generateThreadName: true,
      maxRAGResults: 5,
      enableSentimentAnalysis: true,
      confidenceThreshold: 0.8,
      escalationKeywords: ['legal', 'lawyer', 'unacceptable', 'competitor', 'switch']
    };

    console.log(`🤖 Model: ${agentConfig.model}`);
    console.log(`🔍 RAG enabled: ${agentConfig.includeRAG}`);
    console.log(`🏷️  Thread naming: ${agentConfig.generateThreadName}`);
    console.log(`📚 Max RAG results: ${agentConfig.maxRAGResults}`);

    // Step 4: Run enhanced agent analysis
    console.log('\n🔄 Step 4: Running enhanced agent analysis...');
    console.log('This will demonstrate:');
    console.log('  • Email thread analysis');
    console.log('  • RAG knowledge retrieval (skeleton)');
    console.log('  • Automatic thread naming');
    console.log('  • Sentiment and escalation detection');
    console.log('  • Enhanced response drafting');
    console.log('\n⏳ Processing... (this may take 30-60 seconds)');
    
    const startTime = Date.now();
    const enhancedResponse = await assistSupportPersonEnhanced(
      emailThread,
      supportContext,
      agentConfig
    );
    const processingTime = (Date.now() - startTime) / 1000;

    console.log(`\n✅ Analysis completed in ${processingTime.toFixed(1)} seconds!`);
    console.log('═'.repeat(80));

    // Step 5: Display comprehensive results
    console.log('\n🎯 ENHANCED AGENT RESULTS:');
    console.log('═'.repeat(80));

    console.log('\n🏷️  THREAD NAME:');
    console.log('─'.repeat(50));
    console.log(`"${enhancedResponse.threadName}"`);

    console.log('\n🧠 AGENT REASONING:');
    console.log('─'.repeat(50));
    console.log(enhancedResponse.reasoning);

    console.log('\n📝 DRAFTED RESPONSE:');
    console.log('─'.repeat(50));
    console.log(enhancedResponse.draft);

    console.log('\n📊 ANALYSIS METRICS:');
    console.log('─'.repeat(50));
    console.log(`• Confidence: ${(enhancedResponse.confidence * 100).toFixed(1)}%`);
    console.log(`• Suggested Priority: ${enhancedResponse.suggestedPriority?.toUpperCase() || 'N/A'}`);
    console.log(`• Escalation Recommended: ${enhancedResponse.escalationRecommended ? '🚨 YES' : '✅ NO'}`);
    console.log(`• Customer Sentiment: ${enhancedResponse.customerSentiment?.toUpperCase() || 'N/A'}`);
    console.log(`• Follow-up Required: ${enhancedResponse.followUpRequired ? '📅 YES' : '❌ NO'}`);
    console.log(`• Estimated Resolution Time: ${enhancedResponse.estimatedResolutionTime || 'N/A'} hours`);

    if (enhancedResponse.additionalActions?.length) {
      console.log('\n🎯 RECOMMENDED ACTIONS:');
      console.log('─'.repeat(50));
      enhancedResponse.additionalActions.forEach((action, index) => {
        console.log(`${index + 1}. ${action}`);
      });
    }

    if (enhancedResponse.tags?.length) {
      console.log('\n🏷️  SUGGESTED TAGS:');
      console.log('─'.repeat(50));
      console.log(enhancedResponse.tags.join(', '));
    }

    if (enhancedResponse.ragSources?.length) {
      console.log('\n📚 RAG KNOWLEDGE SOURCES:');
      console.log('─'.repeat(50));
      enhancedResponse.ragSources.forEach((source, index) => {
        console.log(`${index + 1}. ${source.title} (${source.category}) - ${(source.relevanceScore * 100).toFixed(1)}% relevance`);
      });
    }

    // Step 6: Demonstrate individual tools
    console.log('\n🛠️  INDIVIDUAL TOOL DEMONSTRATIONS:');
    console.log('═'.repeat(80));

    // Thread naming only
    console.log('\n🏷️  Thread Naming Tool:');
    console.log('─'.repeat(30));
    const threadNamingResult = await generateThreadName({
      thread: emailThread,
      maxLength: 40,
      includeCustomerName: true,
      includeIssueType: true
    });
    console.log(`Generated: "${threadNamingResult.name}"`);
    console.log(`Confidence: ${(threadNamingResult.confidence * 100).toFixed(1)}%`);
    console.log(`Issue Type: ${threadNamingResult.detectedIssueType}`);
    console.log(`Key Topics: ${threadNamingResult.keyTopics?.join(', ') || 'None'}`);

    // RAG query only (skeleton demonstration)
    console.log('\n📚 RAG Policy Query Tool:');
    console.log('─'.repeat(30));
    const ragResults = await queryCompanyPolicies('premium subscription refund policy', 'refund');
    console.log(`Found ${ragResults.length} policy documents:`);
    ragResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.title} (${(result.relevanceScore * 100).toFixed(1)}% match)`);
    });

    console.log('\n🎉 Enhanced example completed successfully!');
    console.log('\n💡 Key Benefits Demonstrated:');
    console.log('  ✅ Complete email thread analysis (vs single emails)');
    console.log('  ✅ RAG integration for company knowledge (skeleton ready)');
    console.log('  ✅ Automatic thread naming like ChatGPT');
    console.log('  ✅ Enhanced sentiment and escalation detection');
    console.log('  ✅ Comprehensive support context integration');
    console.log('  ✅ Configurable agent behavior');
    console.log('  ✅ Detailed logging and monitoring');
    console.log('  ✅ Multiple specialized tools available');

    console.log('\n🔗 Next Steps for Integration:');
    console.log('  1. Replace RAG skeleton functions with real backend');
    console.log('  2. Connect email thread data from your database');
    console.log('  3. Integrate customer context APIs');
    console.log('  4. Deploy enhanced agent in production');
    console.log('  5. Monitor performance and accuracy metrics');

  } catch (error) {
    console.error('\n❌ Error in enhanced example:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Tip: Make sure you have a .env file with OPENAI_API_KEY=your-api-key');
    } else if (error.message.includes('model')) {
      console.log('\n💡 Tip: Try using gpt-4o-mini if you have API limits');
    } else {
      console.log('\n💡 Tip: Check your internet connection and OpenAI API status');
    }
  }
}

// Run the enhanced example
if (require.main === module) {
  runEnhancedExample();
} 